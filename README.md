# SkillMatch AI

![SkillMatch AI](SKILLMATCHERAI.png)

SkillMatch AI turns a resume into a practical career signal. Upload a resume, choose an optional location, and get ranked role recommendations with fit scores, missing skills, and direct job-search links.

## Features

- Extracts skills, experience, education, organizations, and contact details from resumes.
- Supports PDF, DOCX, and TXT resumes.
- Ranks likely career paths using detected skills.
- Explains lower scores with the skills that are missing from the resume.
- Creates direct LinkedIn and Unstop searches for each recommended role.
- Uses semantic embeddings to identify related skills and improve matching.
- Stores job analysis results in a local SQLite database.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS CDN, Framer Motion
- Backend: FastAPI, Uvicorn, spaCy, Sentence Transformers
- Document parsing: `pdfplumber`, `python-docx`
- Storage: SQLite

## Requirements

- Node.js 18 or newer
- Python 3.10 or newer
- A virtual environment is recommended for the Python dependencies.

## Setup

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Create and activate a Python environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

The first backend start can also download the `all-MiniLM-L6-v2` sentence-transformer model.

## Run Locally

Start the backend in one terminal:

```bash
uvicorn main:app --reload --port 8000
```

Start the frontend in a second terminal:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite development server proxies `/api` requests to `http://localhost:8000`.

## Production Build

```bash
npm run build
```

The compiled frontend is written to `dist/`.

## API

### `POST /api/job-matches`

Accepts a multipart form with:

- `resume`: PDF, DOCX, or TXT file
- `location`: optional preferred location

Returns the detected resume profile and ranked role matches, including fit scores, missing skills, and external job-search links.

### `GET /docs`

Opens the interactive FastAPI API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

## Troubleshooting

- If the frontend shows a network or JSON parsing error, make sure the FastAPI server is running on port `8000`.
- If startup fails while loading spaCy, install the model with `python -m spacy download en_core_web_sm`.
- The first model load may take longer than later requests because Sentence Transformers downloads its model files once.
- Local runtime files such as `.venv`, `node_modules`, `dist`, caches, and `skillmatch.db` are excluded through `.gitignore`.