import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openai = null;
if (process.env.DEEPSEEK_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
  });
}

/**
 * Parses raw resume text into structured profile JSON + ATS metrics.
 */
export async function parseResume(resumeText) {
  if (openai) {
    try {
      console.log('Sending resume text to DeepSeek for parsing and ATS review...');
      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI Resume Parser & ATS Auditor. Parse the resume text into a structured JSON object. 
            Do not wrap your output in markdown code blocks. Output ONLY valid raw JSON.
            
            JSON schema:
            {
              "name": "Full Name",
              "email": "email@example.com or null",
              "phone": "phone number or null",
              "skills": ["Skill 1", "Skill 2", ...],
              "targetRoles": ["Role 1", "Role 2", ...],
              "experienceLevel": "Internship" | "Entry Level" | "Mid Level" | "Senior",
              "summary": "A 2-sentence summary of the candidate's background.",
              "keywords": ["search_keyword1", "search_keyword2", ...],
              "atsScore": 85,
              "atsFeedback": [
                { "type": "success" | "warning" | "danger", "message": "Feedback item details..." },
                ...
              ]
            }
            
            In "atsFeedback", evaluate formatting, structural sections, skills depth, and details. Generate 3-5 concrete tips.`
          },
          {
            role: 'user',
            content: resumeText
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const parsedJSON = JSON.parse(response.choices[0].message.content.trim());
      console.log('Successfully parsed resume with DeepSeek.');
      return parsedJSON;
    } catch (error) {
      console.error('DeepSeek parser error, falling back to heuristic:', error.message);
    }
  }

  return runHeuristicParser(resumeText);
}

/**
 * AI Cover Letter generator using DeepSeek chat.
 */
export async function generateCoverLetter(profile, job) {
  if (openai) {
    try {
      console.log(`Generating cover letter using DeepSeek for ${job.title} at ${job.company}...`);
      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career consultant. Draft a compelling, professional cover letter matching the candidate\'s resume profile to the specified job description. Keep it under 350 words, authentic, and high-impact.'
          },
          {
            role: 'user',
            content: `CANDIDATE PROFILE:\n${JSON.stringify(profile, null, 2)}\n\nJOB SPECIFICATION:\n${JSON.stringify(job, null, 2)}`
          }
        ],
        temperature: 0.7
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('DeepSeek cover letter error, falling back to template:', error.message);
    }
  }

  return generateTemplateCoverLetter(profile, job);
}

/**
 * AI Mock Interview grader using DeepSeek.
 */
export async function evaluateInterview(job, QAs) {
  if (openai) {
    try {
      console.log(`Grading interview answers using DeepSeek for ${job.title}...`);
      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert interviewer. Review the questions and candidate answers for the given job.
            Return a structured JSON object containing a total rating, reviews for each question, and suggestions for improvement.
            Do not wrap output in markdown code blocks. Output ONLY valid raw JSON.

            JSON Schema:
            {
              "overallRating": 78,
              "summary": "Summary feedback of the candidate's performance.",
              "evaluations": [
                {
                  "question": "Question text",
                  "answer": "Candidate's answer",
                  "score": 8, 
                  "feedback": "Specific feedback for this question.",
                  "suggestedImprovement": "How they can frame it better next time."
                },
                ...
              ]
            }`
          },
          {
            role: 'user',
            content: `JOB TITLE: ${job.title}\nCOMPANY: ${job.company}\n\nQUESTIONS & CANDIDATE ANSWERS:\n${JSON.stringify(QAs, null, 2)}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content.trim());
    } catch (error) {
      console.error('DeepSeek interview grading error, falling back to local:', error.message);
    }
  }

  return evaluateInterviewHeuristically(job, QAs);
}

/* --- Heuristic Local Fallbacks --- */

function runHeuristicParser(text) {
  console.log('Running local heuristic parser with ATS scanner...');
  const cleanText = text.replace(/\s+/g, ' ');

  // Contact Info
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = cleanText.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : null;

  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = cleanText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : null;

  let name = "Developer Candidate";
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')) {
    name = lines[0];
  }

  // Skills
  const skillDict = [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Next.js',
    'Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C++', 'C#', 
    'SQL', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Docker', 'Kubernetes', 'Git',
    'Tailwind', 'Bootstrap', 'Figma', 'UI/UX', 'Machine Learning', 'Data Analysis', 
    'Pandas', 'NumPy', 'FastAPI', 'Android', 'Flutter', 'React Native', 'PHP', 'Laravel'
  ];

  const extractedSkills = [];
  skillDict.forEach(skill => {
    // Escape special characters for regex
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Check boundaries: only prepend/append \b if starting/ending with a word character
    const startBoundary = /^\w/.test(skill) ? '\\b' : '';
    const endBoundary = /\w$/.test(skill) ? '\\b' : '';
    
    const regex = new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'i');
    if (regex.test(cleanText)) {
      extractedSkills.push(skill);
    }
  });

  if (extractedSkills.length === 0) {
    extractedSkills.push('JavaScript', 'HTML', 'CSS', 'React');
  }

  // Experience level
  let experienceLevel = 'Entry Level';
  if (/intern/i.test(cleanText)) {
    experienceLevel = 'Internship';
  } else if (/senior|lead|architect|manager/i.test(cleanText)) {
    experienceLevel = 'Senior';
  } else if (/mid|2\+|3\+|4\+|5\+ years/i.test(cleanText)) {
    experienceLevel = 'Mid Level';
  }

  // Roles
  const roleDict = [
    'Frontend Developer', 'Frontend Engineer', 'Backend Developer', 'Backend Engineer',
    'Full Stack Developer', 'Full Stack Engineer', 'Software Engineer', 'Web Developer',
    'Data Scientist', 'Data Analyst', 'UI/UX Designer', 'Mobile Developer', 'Product Manager'
  ];
  
  const targetRoles = [];
  roleDict.forEach(role => {
    const regex = new RegExp(role, 'i');
    if (regex.test(cleanText)) {
      targetRoles.push(role);
    }
  });

  if (targetRoles.length === 0) {
    if (extractedSkills.includes('React') || extractedSkills.includes('HTML')) {
      targetRoles.push('Frontend Developer');
    }
    if (extractedSkills.includes('Node.js') || extractedSkills.includes('Python')) {
      targetRoles.push('Backend Developer');
    }
    targetRoles.push('Software Engineer');
  }

  const keywords = [...new Set([...targetRoles, ...extractedSkills.slice(0, 5)])]
    .map(k => k.toLowerCase())
    .slice(0, 6);

  const summary = `Dedicated technical professional with skills in ${extractedSkills.slice(0, 4).join(', ')}. Seeking opportunities for ${targetRoles[0] || 'Software Engineering'} roles matching their background.`;

  // Compute Heuristic ATS Score
  let atsScore = 40;
  const atsFeedback = [];

  if (email && phone) {
    atsScore += 15;
    atsFeedback.push({ type: 'success', message: 'Essential contact details (email and phone) are present.' });
  } else {
    atsFeedback.push({ type: 'danger', message: 'Missing core contact details in header. Ensure email and phone number are visible.' });
  }

  if (extractedSkills.length >= 6) {
    atsScore += 15;
    atsFeedback.push({ type: 'success', message: 'Rich technical skills list parsed successfully (6+ skills).' });
  } else {
    atsScore += 5;
    atsFeedback.push({ type: 'warning', message: 'Light skills inventory. Consider adding details of all frameworks, libraries, and utilities you know.' });
  }

  if (text.length > 800) {
    atsScore += 10;
    atsFeedback.push({ type: 'success', message: 'Resume length is optimal for descriptive indexing.' });
  } else {
    atsFeedback.push({ type: 'warning', message: 'Short profile description. Expand on your project highlights, bulleting your metrics and responsibilities.' });
  }

  if (/experience|intern|work|employment/i.test(cleanText)) {
    atsScore += 10;
    atsFeedback.push({ type: 'success', message: 'Experience section with chronological landmarks detected.' });
  } else {
    atsFeedback.push({ type: 'danger', message: 'No clear professional history headings found. Add a dedicated "Experience" or "Projects" section.' });
  }

  if (/education|degree|btech|b\.tech|university|college|school|bsc|b\.sc|mtech/i.test(cleanText)) {
    atsScore += 5;
    atsFeedback.push({ type: 'success', message: 'Academic credentials and degree milestones verified.' });
  } else {
    atsFeedback.push({ type: 'warning', message: 'No explicit education or degree keywords detected. Ensure your university landmarks are labeled.' });
  }

  if (/project|portfolio|hackathon|github/i.test(cleanText)) {
    atsScore += 5;
    atsFeedback.push({ type: 'success', message: 'Hands-on projects or code repository references parsed.' });
  } else {
    atsFeedback.push({ type: 'warning', message: 'Missing Github or project showcases. Recruiters value active portfolios for technical validation.' });
  }

  return {
    name,
    email,
    phone,
    skills: extractedSkills,
    targetRoles: [...new Set(targetRoles)],
    experienceLevel,
    summary,
    keywords,
    atsScore,
    atsFeedback
  };
}

function generateTemplateCoverLetter(profile, job) {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const targetRole = job.title;
  const company = job.company;
  const name = profile.name || 'Developer Candidate';
  const skillsList = profile.skills.slice(0, 4).join(', ');
  
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${targetRole} position at ${company}. As a dedicated professional with hands-on experience in ${skillsList}, I am confident that my technical skills and proactive mindset align perfectly with your team's objectives.

In my recent experience, I have worked extensively with core software systems, focused on delivering clean, modular layouts and optimized backend APIs. I am passionate about tackling the exact types of scale and user experience challenges that ${company} is currently solving.

I am eager to bring my capabilities in ${profile.skills[0] || 'software development'} to your team, and contribute to your upcoming projects. Thank you for your time and consideration. I look forward to the possibility of discussing how my background meets your needs in an interview.

Sincerely,

${name}
${profile.email || ''} | ${profile.phone || ''}`;
}

function evaluateInterviewHeuristically(job, QAs) {
  console.log('Running local heuristic interview grader...');
  let scoreSum = 0;
  
  const evaluations = QAs.map(qa => {
    const answerLen = (qa.answer || '').trim().length;
    let score = 4; // baseline score
    let feedback = '';
    let suggestedImprovement = '';

    if (answerLen === 0) {
      score = 0;
      feedback = 'No answer was provided for this question.';
      suggestedImprovement = 'Provide an answer using the STAR method (Situation, Task, Action, Result).';
    } else if (answerLen < 40) {
      score = 5;
      feedback = 'Your answer is very short and lacks detail or specific achievements.';
      suggestedImprovement = 'Include technical specifics, tools used, and the direct impact of your actions.';
    } else {
      score = 8;
      feedback = 'Solid answer containing clear descriptions of your technical approach.';
      suggestedImprovement = 'Add quantifiable metrics (e.g. "improved loading speed by 25%") to make it stronger.';
    }

    scoreSum += score;
    return {
      question: qa.question,
      answer: qa.answer,
      score,
      feedback,
      suggestedImprovement
    };
  });

  const overallRating = Math.round((scoreSum / (QAs.length * 10)) * 100);

  return {
    overallRating,
    summary: `Local evaluation complete. Overall score: ${overallRating}/100. Your answers demonstrate standard proficiency. Review the suggested improvements to elevate your interview readiness.`,
    evaluations
  };
}

/**
 * AI Resume Polisher using DeepSeek.
 */
export async function polishResume(profile) {
  if (openai) {
    try {
      console.log('Polishing resume with DeepSeek AI...');
      const response = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert executive resume writer. Polish and optimize the candidate's resume details to maximize ATS compatibility and appeal to senior recruiters.
            Provide:
            1. A highly polished, professional summary (2-3 sentences).
            2. 3-4 impactful, metrics-driven bullet points suitable for their experience/projects.
            3. 4-5 recommended technical skills to learn/add based on their target roles.
            
            Do not wrap your output in markdown code blocks. Output ONLY valid raw JSON.
            
            JSON schema:
            {
              "polishedSummary": "A polished professional summary...",
              "polishedExperience": [
                "Achieved X by implementing Y, resulting in Z% improvement.",
                "Built X using Y, optimizing performance by Z%...",
                ...
              ],
              "recommendedSkills": ["Skill A", "Skill B", ...]
            }`
          },
          {
            role: 'user',
            content: `CANDIDATE PROFILE:\n${JSON.stringify(profile, null, 2)}`
          }
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content.trim());
    } catch (error) {
      console.error('DeepSeek resume polishing error, falling back to local:', error.message);
    }
  }

  return polishResumeHeuristically(profile);
}

function polishResumeHeuristically(profile) {
  const skillsList = (profile.skills || []).slice(0, 3).join(', ') || 'software development';
  const rolesList = (profile.targetRoles || []).join(' or ') || 'Software Engineering';
  
  const polishedSummary = `Results-driven developer with foundational expertise in ${skillsList}. Proven capability to deliver clean code, optimize databases, and contribute to technical project lifecycles. Eager to leverage these skills for high-impact ${rolesList} opportunities.`;
  
  const polishedExperience = [
    `Designed and deployed robust technical solutions using ${profile.skills[0] || 'Python'}, improving execution efficiency and code maintainability.`,
    `Collaborated on multi-functional projects, integrating databases and building interactive components resulting in seamless user workflows.`,
    `Engineered and optimized local applications, executing rigorous testing to locate and address bottleneck issues, reducing debugging cycles by 20%.`
  ];
  
  const recommendedSkills = ['Git', 'Docker', 'REST APIs', 'TypeScript', 'SQL'];
  
  return {
    polishedSummary,
    polishedExperience,
    recommendedSkills
  };
}
