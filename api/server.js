import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';
import { parseResume, generateCoverLetter, evaluateInterview } from './services/deepseekService.js';
import { matchJobs } from './services/matchingService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

/**
 * POST /api/analyze-resume
 * Receives a PDF resume, parses it, calls DeepSeek to extract profile + ATS audit details.
 */
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';

    if (req.file) {
      console.log(`Received PDF upload: ${req.file.originalname} (${req.file.size} bytes)`);
      const dataBuffer = req.file.buffer;
      const parsedPdf = await pdfParse(dataBuffer);
      resumeText = parsedPdf.text;
    } else if (req.body.resumeText) {
      console.log('Received raw resume text in request body.');
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ error: 'No resume PDF file or text provided.' });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ error: 'Extracted resume text is empty.' });
    }

    const parsedProfile = await parseResume(resumeText);
    res.json(parsedProfile);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: error.message || 'An error occurred during resume analysis.' });
  }
});

/**
 * POST /api/match-jobs
 * Scores the user profile against job listings.
 */
app.post('/api/match-jobs', (req, res) => {
  try {
    const profile = req.body;
    if (!profile || !profile.skills || !profile.targetRoles) {
      return res.status(400).json({ error: 'Invalid or incomplete profile provided.' });
    }

    const matches = matchJobs(profile);
    res.json(matches);
  } catch (error) {
    console.error('Error matching jobs:', error);
    res.status(500).json({ error: error.message || 'An error occurred during job matching.' });
  }
});

/**
 * POST /api/generate-cover-letter
 * Calls DeepSeek to draft a customized cover letter for a specific job card.
 */
app.post('/api/generate-cover-letter', async (req, res) => {
  try {
    const { profile, job } = req.body;
    if (!profile || !job) {
      return res.status(400).json({ error: 'Profile and Job parameters are required.' });
    }

    const coverLetter = await generateCoverLetter(profile, job);
    res.json({ coverLetter });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ error: error.message || 'Failed to generate cover letter.' });
  }
});

/**
 * POST /api/evaluate-interview
 * Evaluates candidate responses to mock interview questions.
 */
app.post('/api/evaluate-interview', async (req, res) => {
  try {
    const { job, QAs } = req.body;
    if (!job || !QAs) {
      return res.status(400).json({ error: 'Job and QAs parameters are required.' });
    }

    const evaluation = await evaluateInterview(job, QAs);
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating interview:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate interview.' });
  }
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
