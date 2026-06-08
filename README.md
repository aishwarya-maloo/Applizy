# TalentMatch - AI Resume Job & Internship Finder

TalentMatch is a premium full-stack application that parses a candidate's resume (PDF or raw text) using **DeepSeek AI** and matches their qualifications, skills, and experience level to over 50+ job and internship options. It also generates pre-filled direct search links for **LinkedIn** and **Naukri.com** based on the parsed resume.

---

## Features
- **DeepSeek AI Resume Parsing:** Extracts skills, target roles, experience level, contact information, and a summary.
- **Intelligent Local Fallback:** Runs regex-based profile parsing if no API key is provided, enabling immediate testing.
- **Dynamic Job Matching:** Ranks jobs from an indexed database of 110 vacancies based on skill overlap, target roles, and experience.
- **Platform Direct Searches:** Generates custom direct search URLs for LinkedIn and Naukri.com to run live searches instantly.
- **Premium Aesthetics:** Vanilla CSS dark mode interface with glassmorphism panels, glowing cards, animated progress scores, and interactive resume upload dropzone.

---

## Folder Structure
- `backend/`: Node.js Express server with PDF parsing and DeepSeek client.
- `frontend/`: Vite + React frontend with a responsive custom design system.

---

## Setup Instructions

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

## How to Test
1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Drag and drop any developer/designer resume PDF into the upload area.
3. Or, click one of the **"Try Sample"** buttons (Frontend Developer, Backend Developer, or UI/UX Designer) to see the parser and matches run instantly.
4. Browse the matched jobs, apply filters (Location, Platform, Score, Job Type), and view the AI's pros/cons analysis for each role.
5. Click **"Search LinkedIn Jobs"** or **"Search Naukri.com Jobs"** at the top of your matching list to open pre-filled search queries on those platforms.
