import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const glass = "bg-white/90 border border-[#dfe4dc] rounded-[1.4rem] shadow-[0_18px_55px_rgba(31,49,42,.07)]";
const fade = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -24 }, transition: { duration: 0.4 } };

function Drop({ label, multiple, files, onFiles }) {
  const ref = useRef();
  return (
    <div onClick={() => ref.current.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onFiles([...e.dataTransfer.files]); }}
      className="group relative min-h-[18rem] overflow-hidden rounded-[1.4rem] border border-dashed border-[#b9c7bb] bg-[#fbfcf8] p-7 text-left cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-[#ed6845] hover:bg-white hover:shadow-[0_18px_40px_rgba(237,104,69,.12)]">
      <input ref={ref} type="file" hidden multiple={multiple} accept=".pdf,.docx,.txt"
        onChange={(e) => onFiles([...e.target.files])} />
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e4f0e6] text-xl text-[#256044]">{multiple ? "▤" : "↥"}</span>
        <span className="rounded-full bg-[#f0f2eb] px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#738276]">{multiple ? "Multiple files" : "One file"}</span>
      </div>
      <div className="mt-12 font-bold text-xl tracking-tight text-[#152033]">{label}</div>
      <div className="text-sm text-[#738276] mt-2 leading-relaxed">
        {files.length ? files.map((f) => f.name).join(", ") : "PDF / DOCX — click or drop"}
      </div>
      <div className="absolute bottom-6 left-7 right-7 flex items-center justify-between border-t border-[#e5eae3] pt-4 text-xs font-semibold text-[#ed6845]">
        <span>{files.length ? "Ready to analyze" : "Choose a file"}</span><span className="text-lg transition-transform group-hover:translate-x-1">→</span>
      </div>
    </div>
  );
}

function Gauge({ value, size = 140 }) {
  const r = size / 2 - 12, c = 2 * Math.PI * r;
  const color = value >= 70 ? "#34d399" : value >= 45 ? "#60a5fa" : "#f87171";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.1)" strokeWidth="10" fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-950">{Math.round(value)}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

const tone = {
  match: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  near: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  missing: "bg-red-500/15 text-red-300 border-red-400/30",
};

const marketSkills = [
  { name: "Python", group: "Core engineering", demand: "Very high", why: "Used across backend, automation, data, and AI roles." },
  { name: "SQL", group: "Data foundation", demand: "Very high", why: "A baseline requirement for product, analytics, and engineering teams." },
  { name: "Cloud platforms", group: "Infrastructure", demand: "Very high", why: "AWS, Azure, or GCP experience unlocks more production roles." },
  { name: "React", group: "Frontend", demand: "High", why: "A durable choice for modern product and web application work." },
  { name: "Docker", group: "Infrastructure", demand: "High", why: "Signals that you can package and ship software reliably." },
  { name: "Data analysis", group: "Data foundation", demand: "High", why: "Turns business questions into measurable decisions." },
  { name: "AI and LLMs", group: "Emerging", demand: "Very high", why: "Fast-growing across product, automation, and engineering teams." },
  { name: "Communication", group: "Human skills", demand: "High", why: "Strong collaboration remains a differentiator at every level." },
];

const careerRoles = [
  { title: "Software Engineer", missingSkills: ["python", "java", "javascript", "typescript", "go", "rust"] },
  { title: "Frontend Developer", missingSkills: ["react", "vue", "angular", "javascript", "typescript", "html", "css"] },
  { title: "Backend Developer", missingSkills: ["python", "java", "node.js", "fastapi", "flask", "django", "rest api"] },
  { title: "Data Analyst", missingSkills: ["sql", "excel", "pandas", "numpy", "data analysis", "tableau", "statistics"] },
  { title: "Machine Learning Engineer", missingSkills: ["python", "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn"] },
  { title: "DevOps Engineer", missingSkills: ["docker", "kubernetes", "terraform", "aws", "azure", "linux", "ci/cd"] },
];

function Recommendations({ present = [], compact = false, roleOptions = [], selectedRole = "", onRoleChange }) {
  const presentNames = new Set(present.map((skill) => skill.toLowerCase()));
  const selectedMatch = roleOptions.find((role) => role.title === selectedRole);
  const roleSkills = (selectedMatch?.missingSkills || [])
    .filter((skill) => !presentNames.has(skill.toLowerCase()))
    .map((name) => ({ name, group: "Role signal", demand: "Role-critical", why: `Builds a stronger ${selectedRole} profile.` }));
  const demanded = marketSkills
    .filter((skill) => !presentNames.has(skill.name.toLowerCase()))
    .slice(0, compact ? 4 : 6);
  const recommended = roleSkills.length ? roleSkills.slice(0, compact ? 4 : 6) : demanded;

  return (
    <section className={`bg-[#203b3a] border border-[#31584e] border-t-4 border-t-[#ed6845] rounded-[1.4rem] ${compact ? "p-4" : "p-5"} shadow-[0_18px_45px_rgba(23,42,43,.14)] text-white`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ff9b78]">Career radar</p>
          <h2 className="text-xl font-bold mt-1 tracking-tight">Skills worth learning next</h2>
          <p className="text-sm text-[#aec2b6] mt-1">{selectedRole ? `Tune your profile for ${selectedRole}.` : "A market-aware shortlist for your next move."}</p>
        </div>
      </div>
      {roleOptions.length > 0 && <label className="block mb-4"><span className="text-xs font-bold uppercase tracking-[.16em] text-[#aec2b6]">Choose a job title</span><select value={selectedRole} onChange={(event) => onRoleChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#36534d] bg-[#203b3a] px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-[#ff9b78]"><option value="">Select a role</option>{roleOptions.map((role) => <option key={role.title} value={role.title}>{role.title} · {role.score}% fit</option>)}</select></label>}
      <div className={`grid ${compact ? "grid-cols-2" : selectedRole ? "lg:grid-cols-2" : "sm:grid-cols-2"} gap-2.5`}>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#ff9b78]">{selectedRole ? `Recommended for ${selectedRole}` : "Recommended skills"}</p>
          <div className="space-y-3">
        {recommended.map((skill, index) => (
          <motion.div key={skill.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
            className="border border-[#41665b] bg-[#244238]/45 rounded-xl p-3 hover:border-[#ff9b78] hover:bg-[#29483c] transition-colors">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-white">{skill.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#18352b] bg-[#cbe6a9] px-2 py-1 rounded-md">{skill.demand}</span>
            </div>
            <p className="text-xs text-[#aec2b6] mt-1">{skill.group}</p>
            {!compact && <p className="text-sm text-[#aec2b6] mt-2 leading-relaxed">{skill.why}</p>}
          </motion.div>
        ))}
          </div>
        </div>
        {selectedRole && <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#cbe6a9]">Demanded right now</p><div className="space-y-3">{demanded.map((skill, index) => <motion.div key={skill.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + 2) * 0.06 }} className="border border-[#41665b] bg-[#244238]/45 rounded-xl p-3 hover:border-[#ff9b78] transition-colors"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-white">{skill.name}</h3><span className="text-[10px] font-bold uppercase tracking-wide text-[#18352b] bg-[#cbe6a9] px-2 py-1 rounded-md">{skill.demand}</span></div><p className="text-xs text-[#aec2b6] mt-1">{skill.group}</p></motion.div>)}</div></div>}
      </div>
    </section>
  );
}

function JobMatches({ data, onReset }) {
  const rankedMatches = [...data.matches].sort((a, b) => b.score - a.score);
  const [selectedRole, setSelectedRole] = useState(rankedMatches[0]?.title || "");
  return (
    <motion.div {...fade} className="space-y-7">
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ed6845]">Ranked recommendations</p>
          <h2 className="text-3xl font-bold text-[#152033] mt-1 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your strongest career paths</h2>
          <p className="text-sm text-[#738276] mt-2">Prioritized by the skills already visible in your resume.</p>
        </div>
        <button onClick={onReset} className="px-4 py-2 rounded-xl border border-[#cbd6ca] bg-white text-[#256044] font-semibold hover:border-[#ed6845] hover:text-[#ed6845] transition">↥ Upload another resume</button>
      </div>
      <div className="rounded-[1.4rem] bg-[#e9f3df] border border-[#d7e7cc] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#56805c]">Resume signal map</p><p className="text-sm text-[#385744] mt-1">{data.profile.skills.length} skills detected from your resume</p></div>
        <div className="flex flex-wrap gap-2 md:justify-end">{data.profile.skills.map((skill) => <span key={skill} className="px-3 py-1 rounded-full bg-white/75 text-[#256044] text-xs font-semibold border border-[#cde0c3]">{skill}</span>)}</div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        {rankedMatches.map((match, index) => (
          <motion.article key={match.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="bg-white border border-[#dfe4dc] rounded-[1.4rem] p-5 shadow-[0_14px_35px_rgba(31,49,42,.06)] hover:-translate-y-1 transition-transform">
            <div className="flex justify-between gap-3 items-start"><div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9aa79a]">Rank 0{index + 1}{index === 0 ? " · Best fit" : ""}</span><h3 className="font-bold text-xl text-[#152033] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{match.title}</h3></div><span className="text-sm font-bold text-[#256044] bg-[#e9f3df] px-2.5 py-1 rounded-lg">{match.score}%</span></div>
            <div className="mt-5 h-2 rounded-full bg-[#edf0eb] overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${match.score}%` }} transition={{ duration: .8, delay: index * .08 }} className="h-full rounded-full bg-[#ed6845]" /></div>
            {match.missingSkills?.length > 0 && <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wide text-[#738276]">Unlock more signal</p><div className="flex flex-wrap gap-2 mt-2">{match.missingSkills.slice(0, 6).map((skill) => <span key={skill} className="px-2.5 py-1 rounded-md bg-[#fff2e9] text-[#a24d32] text-xs border border-[#f8d8c7]">{skill}</span>)}</div></div>}
            <div className="space-y-2 mt-5">{match.links.map((link) => <a key={link.source} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#e2e8df] hover:border-[#ed6845] hover:bg-[#fff8f3] transition"><span><span className="block font-semibold text-[#152033]">{link.source}</span><span className="block text-xs text-[#738276] mt-1">{link.description}</span></span><span className="text-[#ed6845] text-lg">↗</span></a>)}</div>
          </motion.article>
        ))}
      </div>
      <Recommendations present={data.profile.skills} roleOptions={rankedMatches} selectedRole={selectedRole} onRoleChange={setSelectedRole} />
    </motion.div>
  );
}

function ReportButton() {
  return <button type="button" onClick={() => window.print()} className="print-hidden px-4 py-2 rounded-xl bg-[#172a2b] text-white font-semibold hover:bg-[#ed6845] transition">⇩ Export PDF</button>;
}

function JobDescriptionResult({ data, onReset }) {
  const candidate = data.candidate;
  return (
    <motion.div {...fade} className="space-y-6">
      <div className="flex justify-between items-end gap-4 flex-wrap print-hidden"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ed6845]">Exact role match</p><h2 className="text-3xl font-bold text-[#152033] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{data.job.name}</h2><p className="text-sm text-[#738276] mt-2">A direct comparison between your resume and this job description.</p></div><div className="flex gap-2"><ReportButton /><button onClick={onReset} className="px-4 py-2 rounded-xl border border-[#cbd6ca] bg-white text-[#256044] font-semibold">New match</button></div></div>
      <div className={`${glass} p-6 grid md:grid-cols-[auto_1fr] gap-6 items-center`}><Gauge value={candidate.score} size={170} /><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#56805c]">Resume fit score</p><h3 className="text-2xl font-bold text-[#152033] mt-1">{candidate.name}</h3><p className="text-sm text-[#738276] mt-1">{candidate.explanation}</p><div className="grid grid-cols-3 gap-3 mt-5">{[["Skills", candidate.breakdown.skill], ["Experience", candidate.breakdown.experience], ["Domain", candidate.breakdown.domain]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#e9f3df] p-3 text-center"><strong className="block text-xl text-[#256044]">{value}%</strong><span className="text-xs text-[#56805c]">{label}</span></div>)}</div></div></div>
      <div className="grid lg:grid-cols-2 gap-5"><div className="bg-[#e9f3df] border border-[#d7e7cc] rounded-[1.4rem] p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#56805c]">Matched signals · {candidate.matched.length}</p><div className="flex flex-wrap gap-2 mt-4">{candidate.matched.map((item) => <span key={item.skill} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#256044]">{item.skill}</span>)}</div></div><div className="bg-[#fff2e9] border border-[#f8d8c7] rounded-[1.4rem] p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a24d32]">Skills to strengthen · {candidate.missing.length}</p><div className="flex flex-wrap gap-2 mt-4">{candidate.missing.map((item) => <span key={item.skill} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#a24d32]">{item.skill}</span>)}</div></div></div>
    </motion.div>
  );
}

function ImprovementResults({ data, onReset }) {
  return (
    <motion.div {...fade} className="space-y-6">
      <div className="flex justify-between items-end gap-4 flex-wrap print-hidden"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ed6845]">Resume improvement studio</p><h2 className="text-3xl font-bold text-[#152033] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Make your signal stronger</h2><p className="text-sm text-[#738276] mt-2">Focused suggestions based on the skills and roles detected in your resume.</p></div><div className="flex gap-2"><ReportButton /><button onClick={onReset} className="px-4 py-2 rounded-xl border border-[#cbd6ca] bg-white text-[#256044] font-semibold">Improve another</button></div></div>
      <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-5"><div className="bg-[#172a2b] rounded-[1.4rem] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#ff9b78]">Priority skills</p><h3 className="text-2xl font-bold mt-2">Close the highest-value gaps.</h3><div className="flex flex-wrap gap-2 mt-6">{data.prioritySkills.map((skill) => <span key={skill} className="rounded-full bg-[#29483c] border border-[#41665b] px-3 py-1.5 text-sm text-[#cbe6a9]">{skill}</span>)}</div></div><div className="grid sm:grid-cols-3 gap-3">{data.suggestions.map((suggestion, index) => <article key={suggestion.title} className="rounded-[1.4rem] border border-[#dfe4dc] bg-white p-5"><span className="text-3xl font-bold text-[#ed6845]">0{index + 1}</span><h3 className="font-bold text-[#152033] mt-5">{suggestion.title}</h3><p className="text-sm text-[#738276] mt-2 leading-relaxed">{suggestion.detail}</p></article>)}</div></div>
    </motion.div>
  );
}

const Tag = ({ kind, children, title }) => (
  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} title={title}
    className={`px-3 py-1 rounded-full text-sm border ${tone[kind]}`}>{children}</motion.span>
);

function Detail({ c }) {
  return (
    <motion.div key={c.file} {...fade} className={`${glass} p-6`}>
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <Gauge value={c.score} />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-950">{c.name}</h3>
          <p className="text-sm text-slate-400">{c.file}{c.email && ` · ${c.email}`}</p>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center text-sm">
            {[["Skills", c.breakdown.skill], ["Experience", c.breakdown.experience], ["Domain", c.breakdown.domain]].map(([k, v]) => (
              <div key={k} className="bg-white/5 rounded-xl p-2"><div className="text-lg font-semibold">{v}%</div><div className="text-slate-400">{k}</div></div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 text-slate-600 text-sm leading-relaxed">{c.explanation}</p>
      {[["match", "Matched", c.matched, (i) => `≈ ${i.via} (${i.similarity})`],
        ["near", "Near-match (semantically related)", c.near, (i) => `closest: ${i.via} (${i.similarity})`],
        ["missing", "Missing", c.missing, () => "no close equivalent found"]].map(([k, label, items, tip]) =>
        items.length > 0 && (
          <div key={k} className="mt-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">{label} · {items.length}</div>
            <div className="flex flex-wrap gap-2">{items.map((i) => <Tag key={i.skill} kind={k} title={tip(i)}>{i.skill}{k === "near" && <span className="opacity-60"> ← {i.via}</span>}</Tag>)}</div>
          </div>
        ))}
    </motion.div>
  );
}

function Results({ data, onReset }) {
  const [sort, setSort] = useState({ key: "score", dir: -1 });
  const [sel, setSel] = useState(0);
  const val = (c, k) => (["skill", "experience", "domain"].includes(k) ? c.breakdown[k] : c[k]);
  const rows = [...data.candidates].sort((a, b) => (val(a, sort.key) > val(b, sort.key) ? 1 : -1) * sort.dir);
  const th = (k, l) => (
    <th onClick={() => setSort({ key: k, dir: sort.key === k ? -sort.dir : -1 })}
      className="py-2 px-3 text-left cursor-pointer select-none hover:text-white">{l}{sort.key === k ? (sort.dir < 0 ? " ↓" : " ↑") : ""}</th>
  );
  return (
    <motion.div {...fade} className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">{data.job.name}</h2>
          <p className="text-slate-500 text-sm">{data.job.skills.length} required skills detected · {data.job.years || "no"}y experience required</p>
        </div>
          <button onClick={onReset} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-blue-700 transition">New analysis</button>
      </div>
      <div className={`${glass} overflow-x-auto`}>
        <table className="w-full text-sm text-slate-700">
          <thead className="text-slate-500 border-b border-slate-200"><tr><th className="px-3">#</th>{th("name", "Candidate")}{th("score", "Score")}{th("skill", "Skills")}{th("experience", "Exp")}{th("domain", "Domain")}</tr></thead>
          <tbody>
            {rows.map((c, i) => (
              <motion.tr layout key={c.file} onClick={() => setSel(data.candidates.indexOf(c))}
                className={`cursor-pointer border-b border-slate-100 hover:bg-blue-50 ${data.candidates[sel] === c ? "bg-blue-50" : ""}`}>
                <td className="px-3 py-3 text-slate-400">{i + 1}</td>
                <td className="px-3">{c.name}</td>
                <td className="px-3 font-semibold">{c.score}</td>
                <td className="px-3">{c.breakdown.skill}%</td><td className="px-3">{c.breakdown.experience}%</td><td className="px-3">{c.breakdown.domain}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence mode="wait"><Detail c={data.candidates[sel]} /></AnimatePresence>
      <Recommendations present={data.job.skills} />
    </motion.div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("upload");
  const [tool, setTool] = useState("jobs");
  const [resumes, setResumes] = useState([]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [location, setLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState(careerRoles[0].title);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("skillmatch-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });
  const [themePulse, setThemePulse] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("skillmatch-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemePulse(true);
    setTheme((current) => current === "dark" ? "light" : "dark");
    window.setTimeout(() => setThemePulse(false), 850);
  };

  const findJobs = async (targetLocation = location) => {
    setErr(""); setPhase("job-analysis");
    const fd = new FormData();
    fd.append("resume", resumes[0]);
    fd.append("location", targetLocation);
    try {
      const res = await fetch("/api/job-matches", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "Job search failed");
      setData(await res.json()); setPhase("job-results");
    } catch (e) { setErr(e.message); setPhase("upload"); }
  };
  const matchJob = async () => {
    setErr(""); setPhase("match-analysis");
    const fd = new FormData(); fd.append("resume", resumes[0]); fd.append("job_description", jobDescription);
    try {
      const res = await fetch("/api/job-description-match", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "Job match failed");
      setData(await res.json()); setPhase("match-results");
    } catch (e) { setErr(e.message); setPhase("upload"); }
  };
  const improveResume = async () => {
    setErr(""); setPhase("improve-analysis");
    const fd = new FormData(); fd.append("resume", resumes[0]);
    try {
      const res = await fetch("/api/resume-improvements", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "Resume improvement failed");
      setData(await res.json()); setPhase("improve-results");
    } catch (e) { setErr(e.message); setPhase("upload"); }
  };
  const detectLocation = () => {
    if (!resumes.length) { setErr("Upload your resume before finding nearby jobs."); return; }
    if (!navigator.geolocation) { setErr("Location detection is not supported by this browser."); return; }
    setErr(""); setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      let detected = "Nearby";
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`);
        const result = await response.json();
        const address = result.address || {};
        detected = address.city || address.town || address.village || address.state || "Nearby";
      } catch { detected = "Nearby"; }
      setLocation(detected); setLocating(false); findJobs(detected);
    }, () => { setLocating(false); setErr("Location permission was not available. Enter a location manually."); }, { enableHighAccuracy: false, timeout: 10000 });
  };
  const reset = () => { setPhase("upload"); setResumes([]); setData(null); setJobDescription(""); setErr(""); };

  return (
    <main className={`theme-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8 ${theme === "dark" ? "theme-dark" : "theme-light"}`} style={{ backgroundImage: theme === "dark" ? "linear-gradient(rgba(132,190,157,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(132,190,157,.055) 1px, transparent 1px)" : "linear-gradient(rgba(53,83,70,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(53,83,70,.035) 1px, transparent 1px)", backgroundSize: "34px 34px" }}>
      <AnimatePresence>{themePulse && <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: .88, scale: 1.35 }} exit={{ opacity: 0, scale: 1.7 }} transition={{ duration: .8, ease: "easeOut" }} className={`pointer-events-none fixed inset-0 z-50 ${theme === "dark" ? "bg-[#0b1717]" : "bg-[#f4f5f0]"}`} />}</AnimatePresence>
      <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3"><img src="/SKILLMATCHERAI.png" alt="SkillMatch AI" className="h-10 w-auto max-w-[220px] object-contain object-left" /><span className="hidden sm:inline-block h-2 w-2 rounded-full bg-[#ed6845]" /></div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-[-.04em] text-[#152033] mt-8 leading-[.98]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Make your next<br /><span className="text-[#ed6845]">move legible.</span></h1>
          <p className="text-[#738276] mt-4 max-w-xl text-base leading-relaxed">Turn a resume into a clear career signal: see where you fit, what is missing, and which roles are worth your time.</p>
        </div>
        <div className="flex items-center gap-3"><div className="rounded-2xl border border-[#dfe4dc] bg-white/70 px-4 py-3 text-left sm:text-right text-xs text-[#738276]"><span className="font-bold uppercase tracking-[.16em] text-[#256044]">Live career intelligence</span><br /><span className="inline-block mt-1">Market-aware matching · {theme === "dark" ? "Dark mode" : "Light mode"}</span></div><button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#cbd6ca] bg-[#172a2b] text-xl text-[#f7d89b] shadow-[0_8px_22px_rgba(23,42,43,.18)] hover:scale-105 hover:border-[#ed6845] transition-transform"><motion.span animate={{ rotate: theme === "dark" ? 180 : 0, scale: theme === "dark" ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>{theme === "dark" ? "☾" : "☀"}</motion.span><span className="sr-only">Toggle theme</span></button></div>
      </header>
      {phase === "upload" && <div className="print-hidden flex flex-wrap gap-1 mb-7 p-1 bg-[#e6ebe3] rounded-xl w-fit"><button onClick={() => setTool("jobs")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tool === "jobs" ? "bg-[#172a2b] text-white shadow-sm" : "text-[#738276]"}`}>Find jobs</button><button onClick={() => setTool("match")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tool === "match" ? "bg-[#172a2b] text-white shadow-sm" : "text-[#738276]"}`}>Match a job</button><button onClick={() => setTool("improve")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tool === "improve" ? "bg-[#172a2b] text-white shadow-sm" : "text-[#738276]"}`}>Improve resume</button></div>}
      <AnimatePresence mode="wait">
        {phase === "upload" && (
          <motion.div key="u" {...fade} className="grid lg:grid-cols-[1.2fr_.8fr] gap-6 items-start">
            <div className="space-y-5">
            {tool === "jobs" && <><Drop label="Your resume" files={resumes.slice(0, 1)} onFiles={(f) => setResumes(f.slice(0, 1))} /><div className="max-w-md"><label className="block text-sm font-semibold text-[#385744] mb-2">Preferred location <span className="font-normal text-[#9aa79a]">(optional)</span></label><div className="flex gap-2"><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bengaluru, Remote" className="min-w-0 flex-1 px-4 py-3 rounded-xl border border-[#dfe4dc] bg-white/80 focus:outline-none focus:border-[#ed6845]" /><button type="button" onClick={detectLocation} disabled={locating} className="shrink-0 rounded-xl border border-[#dfe4dc] bg-white px-3 text-xs font-bold text-[#256044] hover:border-[#ed6845] hover:text-[#ed6845] disabled:opacity-50 transition" title="Detect location and find jobs">{locating ? "Locating..." : "◎ Auto-detect"}</button></div></div></>}
            {tool === "match" && <><Drop label="Your resume" files={resumes.slice(0, 1)} onFiles={(f) => setResumes(f.slice(0, 1))} /><div><label className="block text-sm font-semibold text-[#385744] mb-2">Paste the job description</label><textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows="8" placeholder="Paste the role, responsibilities, and requirements here..." className="w-full resize-y rounded-[1.4rem] border border-[#dfe4dc] bg-white/80 px-4 py-3 text-sm text-[#152033] focus:outline-none focus:border-[#ed6845]" /></div></>}
            {tool === "improve" && <><Drop label="Your resume" files={resumes.slice(0, 1)} onFiles={(f) => setResumes(f.slice(0, 1))} /><div className="rounded-[1.4rem] border border-[#dfe4dc] bg-white/70 p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#ed6845]">Improvement studio</p><p className="mt-2 text-sm leading-relaxed text-[#738276]">We will identify high-value skill gaps and give you focused changes to make your resume more convincing.</p></div></>}
            {err && <p className="text-red-600 text-center">{err}</p>}
            <div className="flex items-center justify-between gap-4 rounded-[1.4rem] bg-[#ed6845] p-5 text-white"><div><p className="font-bold">Ready when you are?</p><p className="text-sm text-white/75 mt-1">{tool === "jobs" ? "Find your strongest paths in under a minute." : tool === "match" ? "Get an exact role fit score and skill gaps." : "Turn your resume into a stronger signal."}</p></div><button disabled={!resumes.length || (tool === "match" && !jobDescription.trim())} onClick={tool === "jobs" ? findJobs : tool === "match" ? matchJob : improveResume}
                className="shrink-0 px-5 py-3 rounded-xl font-bold bg-[#172a2b] text-white disabled:opacity-40 hover:bg-[#29483c] hover:-translate-y-0.5 transition">
                {tool === "jobs" ? "Find matching jobs" : tool === "match" ? "Match this job" : "Improve my resume"}
              </button>
            </div>
            </div>
            <Recommendations compact roleOptions={careerRoles} selectedRole={jobTitle} onRoleChange={setJobTitle} />
          </motion.div>
        )}
        {phase === "analysis" && (
          <motion.div key="a" {...fade} className={`${glass} p-12 text-center`}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-16 h-16 mx-auto rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-6 text-lg text-slate-900">Parsing documents, extracting skills, computing embeddings...</p>
            <p className="text-sm text-slate-500 mt-1">First run loads the model and may take a few seconds.</p>
          </motion.div>
        )}
        {phase === "job-analysis" && <motion.div key="ja" {...fade} className={`${glass} p-12 text-center`}><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-16 h-16 mx-auto rounded-full border-4 border-blue-100 border-t-blue-600" /><p className="mt-6 text-lg text-slate-900">Reading your resume and finding your strongest role matches...</p></motion.div>}
        {phase === "match-analysis" && <motion.div key="ma" {...fade} className={`${glass} p-12 text-center`}><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-16 h-16 mx-auto rounded-full border-4 border-blue-100 border-t-blue-600" /><p className="mt-6 text-lg text-slate-900">Comparing your resume against the role requirements...</p></motion.div>}
        {phase === "improve-analysis" && <motion.div key="ia" {...fade} className={`${glass} p-12 text-center`}><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-16 h-16 mx-auto rounded-full border-4 border-blue-100 border-t-blue-600" /><p className="mt-6 text-lg text-slate-900">Finding the highest-value ways to strengthen your resume...</p></motion.div>}
        {phase === "results" && <Results key="r" data={data} onReset={reset} />}
        {phase === "job-results" && <JobMatches key="jm" data={data} onReset={reset} />}
        {phase === "match-results" && <JobDescriptionResult key="mr" data={data} onReset={reset} />}
        {phase === "improve-results" && <ImprovementResults key="ir" data={data} onReset={reset} />}
      </AnimatePresence>
      </div>
    </main>
  );
}
