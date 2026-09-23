"""SkillMatch AI backend. Run: uvicorn main:app --reload --port 8000"""
import io, re, json, sqlite3, datetime as dt
from urllib.parse import quote_plus
import numpy as np, pdfplumber, docx, spacy
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from spacy.matcher import PhraseMatcher
from sentence_transformers import SentenceTransformer

app = FastAPI(title="SkillMatch AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Seed vocabulary for spaCy PhraseMatcher; the semantic layer handles everything the list misses.
SKILLS = """python,java,javascript,typescript,c++,c#,go,rust,sql,nosql,postgresql,mysql,mongodb,redis,sqlite,
react,vue,angular,node.js,fastapi,flask,django,spring boot,html,css,tailwind,rest api,graphql,
machine learning,deep learning,nlp,computer vision,pytorch,tensorflow,keras,scikit-learn,pandas,numpy,
transformers,llm,data analysis,data visualization,tableau,power bi,spark,hadoop,airflow,kafka,etl,
aws,azure,gcp,docker,kubernetes,terraform,ci/cd,jenkins,git,linux,microservices,mlops,
agile,scrum,project management,communication,leadership,statistics,a/b testing,excel""".replace("\n", "").split(",")
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
matcher.add("SKILL", [nlp.make_doc(s.strip()) for s in SKILLS])

ROLE_PATTERNS = [
    ("Software Engineer", {"python", "java", "javascript", "typescript", "go", "rust", "c++"}),
    ("Frontend Developer", {"react", "vue", "angular", "javascript", "typescript", "html", "css"}),
    ("Backend Developer", {"python", "java", "node.js", "fastapi", "flask", "django", "spring boot", "rest api"}),
    ("Data Analyst", {"sql", "excel", "pandas", "numpy", "data analysis", "tableau", "power bi", "statistics"}),
    ("Machine Learning Engineer", {"python", "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "transformers"}),
    ("DevOps Engineer", {"docker", "kubernetes", "terraform", "aws", "azure", "gcp", "jenkins", "linux", "ci/cd"}),
]

db = sqlite3.connect("skillmatch.db", check_same_thread=False)
db.executescript("""CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY, title TEXT, data TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS candidates(id INTEGER PRIMARY KEY, job_id INT, name TEXT, score REAL, data TEXT);""")


def parse_file(f: UploadFile, raw: bytes) -> str:
    n = (f.filename or "").lower()
    if n.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    if n.endswith(".docx"):
        d = docx.Document(io.BytesIO(raw))
        return "\n".join([p.text for p in d.paragraphs] + [c.text for t in d.tables for r in t.rows for c in r.cells])
    if n.endswith(".txt"):
        return raw.decode("utf-8", "ignore")
    raise HTTPException(400, f"Unsupported file type: {f.filename}")


def extract_skills(doc):
    seen = {}
    for _, s, e in matcher(doc):
        seen.setdefault(doc[s:e].text.lower(), None)
    for ent in doc.ents:  # NER: tools/products the vocabulary missed
        if ent.label_ == "PRODUCT" and len(ent.text) < 30:
            seen.setdefault(ent.text.lower(), None)
    return list(seen)


def years_of_experience(text: str, is_jd: bool) -> float:
    explicit = [int(x) for x in re.findall(r"(\d{1,2})\+?\s*(?:-\s*\d+\s*)?(?:years|yrs)", text, re.I)]
    if is_jd:
        return float(min(explicit)) if explicit else 0.0
    now = dt.date.today().year
    spans = re.findall(r"((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present|current|now)", text, re.I)
    total = sum(max(0, (now if not e[0].isdigit() else int(e)) - int(s)) for s, e in spans)
    return float(total or (max(explicit) if explicit else 0))


def structure(text: str, is_jd=False):
    doc = nlp(text[:100_000])
    first = next((l.strip() for l in text.splitlines() if l.strip()), "Unknown")
    person = next((e.text for e in doc.ents[:15] if e.label_ == "PERSON"), None)
    email = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text)
    edu = re.findall(r"\b(ph\.?d|master'?s?|m\.?tech|m\.?s\.?c?|bachelor'?s?|b\.?tech|b\.?e|b\.?sc?)\b", text, re.I)
    return {
        "name": first[:80] if is_jd else (person or first)[:60],
        "email": email.group(0) if email else None,
        "education": sorted({e.lower() for e in edu}),
        "orgs": list(dict.fromkeys(e.text for e in doc.ents if e.label_ == "ORG"))[:6],
        "skills": extract_skills(doc),
        "years": years_of_experience(text, is_jd),
    }


def role_matches(skills):
    skill_set = {skill.lower() for skill in skills}
    ranked = sorted(
        ((role, len(skill_set & pattern), pattern) for role, pattern in ROLE_PATTERNS),
        key=lambda item: item[1],
        reverse=True,
    )
    matches = [
        {
            "title": role,
            "score": round(100 * count / max(1, len(pattern))),
            "missingSkills": sorted(pattern - skill_set),
        }
        for role, count, pattern in ranked if count
    ]
    return matches[:3] or [{"title": "Software Engineer", "score": 0, "missingSkills": sorted(ROLE_PATTERNS[0][1])}]


def job_links(role, skills, location):
    keywords = f"{role} {' '.join(skills[:5])}".strip()
    query = quote_plus(keywords)
    place = quote_plus(location or "")
    return [
        {
            "source": "LinkedIn",
            "url": f"https://www.linkedin.com/jobs/search/?keywords={query}&location={place}",
            "description": "Search current LinkedIn listings using your strongest resume signals.",
        },
        {
            "source": "Unstop",
            "url": f"https://unstop.com/jobs?search={query}",
            "description": "Search Unstop jobs, internships, and early-career opportunities.",
        },
    ]


def semantic_match(jd_skills, cand_skills):
    matched, near, missing = [], [], []
    if not cand_skills:
        return matched, near, [{"skill": s} for s in jd_skills]
    J = model.encode(jd_skills, normalize_embeddings=True)
    C = model.encode(cand_skills, normalize_embeddings=True)
    S = J @ C.T
    for i, skill in enumerate(jd_skills):
        j = int(S[i].argmax()); sim = float(S[i, j])
        if skill in cand_skills or sim >= 0.85:
            matched.append({"skill": skill, "via": cand_skills[j], "similarity": round(sim, 2)})
        elif sim >= 0.50:  # semantic near-match: related, not identical
            near.append({"skill": skill, "via": cand_skills[j], "similarity": round(sim, 2)})
        else:
            missing.append({"skill": skill, "best_guess": cand_skills[j], "similarity": round(sim, 2)})
    return matched, near, missing


def score_candidate(job, jd_text, res_text, cand):
    m, n, x = semantic_match(job["skills"], cand["skills"])
    total = max(1, len(job["skills"]))
    skill = (len(m) + sum(0.6 * i["similarity"] for i in n)) / total
    req = job["years"]
    exp = min(1.0, cand["years"] / req) if req else 1.0
    e = model.encode([jd_text[:2000], res_text[:2000]], normalize_embeddings=True)
    domain = float(np.clip((float(e[0] @ e[1]) - 0.10) / 0.50, 0, 1))
    final = round(100 * (0.55 * skill + 0.20 * exp + 0.25 * domain), 1)
    parts = [f"Matched {len(m)}/{total} required skills"]
    if n: parts.append(f"{len(n)} near-match(es), e.g. '{n[0]['via']}' ≈ '{n[0]['skill']}' ({n[0]['similarity']})")
    if x: parts.append(f"missing: {', '.join(i['skill'] for i in x[:5])}")
    parts.append(f"experience {cand['years']:.0f}y vs {req:.0f}y required" if req else f"{cand['years']:.0f}y experience, none specified")
    parts.append(f"domain relevance {domain*100:.0f}%")
    return {**cand, "score": final, "breakdown": {"skill": round(skill*100), "experience": round(exp*100), "domain": round(domain*100)},
            "matched": m, "near": n, "missing": x, "explanation": ". ".join(parts) + "."}


@app.post("/api/analyze")
async def analyze(jd: UploadFile = File(...), resumes: list[UploadFile] = File(...)):
    jd_text = parse_file(jd, await jd.read())
    job = structure(jd_text, is_jd=True)
    if not job["skills"]:
        raise HTTPException(422, "No skills detected in the job description.")
    results = []
    for r in resumes:
        text = parse_file(r, await r.read())
        results.append(score_candidate(job, jd_text, text, {**structure(text), "file": r.filename}))
    results.sort(key=lambda c: c["score"], reverse=True)
    cur = db.execute("INSERT INTO jobs(title,data,created) VALUES(?,?,?)", (job["name"], json.dumps(job), dt.datetime.utcnow().isoformat()))
    for c in results:
        db.execute("INSERT INTO candidates(job_id,name,score,data) VALUES(?,?,?,?)", (cur.lastrowid, c["name"], c["score"], json.dumps(c)))
    db.commit()
    return {"job_id": cur.lastrowid, "job": job, "candidates": results}


@app.post("/api/job-matches")
async def job_matches(resume: UploadFile = File(...), location: str = ""):
    resume_text = parse_file(resume, await resume.read())
    profile = structure(resume_text)
    if not profile["skills"]:
        raise HTTPException(422, "No skills detected in this resume.")
    roles = role_matches(profile["skills"])
    matches = [{**role, "links": job_links(role["title"], profile["skills"], location)} for role in roles]
    return {"profile": profile, "matches": matches}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: int):
    j = db.execute("SELECT data FROM jobs WHERE id=?", (job_id,)).fetchone()
    if not j: raise HTTPException(404, "Job not found")
    rows = db.execute("SELECT data FROM candidates WHERE job_id=? ORDER BY score DESC", (job_id,)).fetchall()
    return {"job_id": job_id, "job": json.loads(j[0]), "candidates": [json.loads(r[0]) for r in rows]}
