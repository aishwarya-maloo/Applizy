# Talentry - AI Resume Job & Internship Finder

Talentry is a premium full-stack application that parses a candidate's resume (PDF or raw text) using **DeepSeek AI** (with a smart local fallback) and maps their qualifications, skills, and experience level to over 110+ job and internship options. It also generates pre-filled direct search and application links for **LinkedIn** based on the parsed resume.

---

## Features
- **DeepSeek AI Resume Parsing:** Extracts skills, target roles, experience level, contact information, and a summary.
- **Intelligent Local Fallback:** Runs regex-based profile parsing if no API key is provided, enabling immediate testing.
- **Senior Recruiter AI Matching:** Evaluates candidates like a senior recruiter. Under-experience results in low scores (<20%), and FAANG applications for students without top-tier internships are penalized.
- **LinkedIn Exclusivity:** Fully custom direct search and apply links targeting LinkedIn.
- **ATS Audit & Skills Gap:** Includes an interactive skills editor, real-time ATS score, YouTube tutorials for missing skills, and cover letter & interview coach assistants.
- **Premium Aesthetics:** Vanilla CSS dark mode interface with Obsidian & Emerald green glassmorphic panels, glowing cards, animated progress scores, and interactive resume upload dropzone.

---

## Folder Structure
- `backend/`: Node.js Express server with PDF parsing, matching algorithms, and DeepSeek client.
- `frontend/`: Vite + React frontend with a responsive custom design system.

---

## Local Setup Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18+ recommended) installed on your system.

### 1. Configure DeepSeek API Key
1. Go to [DeepSeek Platform](https://platform.deepseek.com/) and create an API key.
2. Open the file `backend/.env`.
3. Set the key in the field:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```
   *(Note: If left empty, the application will automatically fall back to its smart local heuristic parser for offline testing).*

### 2. Install Dependencies
Open your terminal in the project root directory (`C:\Users\aishw\.gemini\antigravity\scratch\resume-job-finder`) and run:
```bash
# Install workspace-wide and workspace-specific dependencies
npm install
npm install --workspace=backend
npm install --workspace=frontend
```

### 3. Run the Application
Start both the Express backend and the Vite dev server concurrently using:
```bash
npm run dev
```

- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend URL:** [http://localhost:5000](http://localhost:5000)

---

## Production Deployment (Vercel & Render / Railway)

Because Vercel is designed for static frontend hosting, it does not automatically run the persistent Express backend. To deploy the full application, you should host the backend and frontend separately.

### Step 1: Deploy the Backend (e.g. Render or Railway)
You can host the Node.js backend on platforms like [Render.com](https://render.com) or [Railway.app](https://railway.app):
1. Create a free account on **Render** or **Railway**.
2. Create a new **Web Service** and connect your GitHub repository (`talentry`).
3. Set the configuration details:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add your environment variables:
   - `PORT`: `5000` (or leave default)
   - `DEEPSEEK_API_KEY`: *(your DeepSeek API key)*
5. Copy the live backend URL provided by the platform (e.g. `https://talentry-backend.onrender.com`).

### Step 2: Configure Vercel Frontend
1. Go to your **Vercel Dashboard** and select your `talentry` project.
2. Go to **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** *(your live backend URL, e.g., `https://talentry-backend.onrender.com`)*. **Do not add a trailing slash `/` at the end.**
4. Go to the **Deployments** tab, find the latest deployment, click the three dots (`...`), and select **Redeploy**. This builds the Vite app with the environment variable injected.

---

## How to Test
1. Open the Vercel frontend URL in your browser.
2. Drag and drop any developer/designer resume PDF into the upload area.
3. Or, click one of the **"Try Sample"** buttons to see the parser and matches run instantly.
4. Browse the matched jobs, edit skills dynamically, practice with the interview coach, or generate custom cover letters.
