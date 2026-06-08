import React, { useState, useRef } from 'react';
import { getApiUrl } from '../config';

// Sample resumes to try out immediately
const SAMPLE_RESUMES = {
  frontend: {
    title: 'React Frontend Developer Resume',
    text: `AISHWARYA SHARMA
aishwarya@example.com | +91 98765 43210 | Bengaluru, India

PROFESSIONAL SUMMARY
Creative and detail-oriented Frontend Developer with 2+ years of experience building modern, responsive user interfaces. Expert in React, JavaScript, and CSS architectures. Experienced in building dashboard UIs, optimizing performance, and translating Figma designs to pixel-perfect code.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), HTML5, CSS3, TypeScript
- Frameworks: React, Redux, Next.js, Tailwind CSS, Bootstrap
- Tools: Git, Figma, Webpack, Vite
- Concepts: REST APIs, Responsive Web Design, Single Page Apps (SPA)

EXPERIENCE
Frontend Developer Intern | TechStart Solutions, Bengaluru (2024 - Present)
- Developed responsive web interfaces using React.js and Tailwind CSS.
- Collaborated with UI/UX designers to translate Figma design screens into reusable React components.
- Integrated REST APIs for user profile and product dashboard modules.

EDUCATION
B.Tech in Computer Science | Bangalore Institute of Technology (Graduating 2025)
`
  },
  backend: {
    title: 'Python Backend Developer Resume',
    text: `KABIR MEHTA
kabir.mehta@example.com | +91 99887 76655 | Pune, India

PROFESSIONAL SUMMARY
Results-driven Software Engineer specialized in backend systems, database optimization, and cloud deployments. Strong hands-on experience in Python (Django/Flask), Node.js, and SQL/NoSQL databases. Passionate about building robust, scalable APIs and microservices.

TECHNICAL SKILLS
- Languages: Python, JavaScript, Java, SQL
- Frameworks: Node.js, Express, Django, Flask, FastAPI
- Databases: PostgreSQL, MongoDB, MySQL, Redis
- Cloud & Devops: AWS (EC2, S3), Docker, Git, REST APIs

EXPERIENCE
Backend Software Engineer | CloudSoft Systems, Pune (2023 - Present)
- Designed and maintained REST APIs using Node.js, Express, and PostgreSQL.
- Decreased API response times by 30% through query optimization and Redis caching.
- Deployed microservices on Docker containers and AWS EC2 instances.

EDUCATION
B.E. in Information Technology | Pune University (2024)
`
  },
  designer: {
    title: 'UI/UX Product Designer Resume',
    text: `SARA SEN
sara.sen@example.com | +91 91234 56789 | Mumbai, India

PROFESSIONAL SUMMARY
User Experience Designer with a deep focus on building intuitive, accessible, and high-impact digital experiences. Expert in user research, wireframing, prototyping, and visual interface systems using Figma. Experienced in working closely with engineering teams to bring design systems to life.

TECHNICAL SKILLS
- Design: Figma, Sketch, Adobe XD, Photoshop, Illustrator
- UI/UX: User Research, Wireframing, Prototyping, Usability Testing, Site Mapping, Design Systems
- Web Fundamentals: HTML, CSS, Responsive Layouts

EXPERIENCE
Product Design Intern | Innovate Studio, Mumbai (2024 - Present)
- Crafted wireframes, interactive prototypes, and UI specifications for an e-commerce mobile application.
- Conducted user testing sessions with 15+ participants, iterating layouts based on qualitative feedback.
- Documented a scalable component library in Figma to standardize layout spacings, styles, and buttons.

EDUCATION
B.Des in Communication Design | National Institute of Design (NID) (2025)
`
  }
};

export default function UploadSection({ onUploadSuccess, onUploadStart, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processUpload = async (formData, isTextPayload = false, textPayload = '') => {
    onUploadStart();
    try {
      let response;
      if (isTextPayload) {
        response = await fetch(getApiUrl('/api/analyze-resume'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: textPayload })
        });
      } else {
        response = await fetch(getApiUrl('/api/analyze-resume'), {
          method: 'POST',
          body: formData
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      onUploadSuccess(data);
    } catch (err) {
      onError(err.message || 'An error occurred while uploading your resume.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        onError('Only PDF files are supported.');
        return;
      }
      const formData = new FormData();
      formData.append('resume', file);
      processUpload(formData);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        onError('Only PDF files are supported.');
        return;
      }
      const formData = new FormData();
      formData.append('resume', file);
      processUpload(formData);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSampleClick = (sampleKey) => {
    const sample = SAMPLE_RESUMES[sampleKey];
    processUpload(null, true, sample.text);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="file-input" 
          accept=".pdf"
        />
        <div className="upload-icon">📄</div>
        <div className="upload-title">Drag & Drop Resume PDF here</div>
        <div className="upload-subtitle">or click to browse from your computer</div>
        <div className="upload-subtitle" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Supports PDF format (Max 5MB)
        </div>
      </div>

      <div className="or-divider">Or test instantly with</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Object.keys(SAMPLE_RESUMES).map((key) => (
          <button
            key={key}
            onClick={() => handleSampleClick(key)}
            className="btn-secondary-action"
            style={{ justifyContent: 'center', width: '100%' }}
          >
            🚀 Try Sample: {SAMPLE_RESUMES[key].title}
          </button>
        ))}
      </div>
    </div>
  );
}
