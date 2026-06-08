import React, { useState, useEffect } from 'react';

const getMockInterviewQuestions = (job) => {
  const title = job.title.toLowerCase();
  if (title.includes('frontend') || title.includes('react') || title.includes('web') || title.includes('ui')) {
    return [
      "Explain the differences between client-side rendering (CSR) and server-side rendering (SSR) in React/Next.js.",
      "How do you manage global state in a large-scale React application?",
      "Describe a complex CSS layout or performance optimization problem you solved recently."
    ];
  } else if (title.includes('backend') || title.includes('node') || title.includes('api') || title.includes('django')) {
    return [
      "Explain what database indexing is, and how it helps optimize SQL or MongoDB query performance.",
      "How would you secure a REST API against common security threats like CSRF or SQL injection?",
      "Describe how you design microservices or manage background queues in Node.js/Python."
    ];
  } else if (title.includes('data') || title.includes('learning') || title.includes('analytics')) {
    return [
      "Explain how you evaluate the performance of a classification model (Precision, Recall, ROC-AUC).",
      "How do you handle missing or highly skewed data before training a machine learning model?",
      "Describe a data pipeline or analysis task you designed and how you extracted actionable metrics."
    ];
  } else if (title.includes('design') || title.includes('ux') || title.includes('figma')) {
    return [
      "Walk us through your user research and wireframing process for a new feature.",
      "How do you maintain a scalable design system in Figma and hand it off to developers?",
      "Tell us about a design review where you had to balance business objectives against user expectations."
    ];
  } else {
    return [
      "How do you structure database schemas to ensure consistency and speed across client-server lines?",
      "How do you handle user authentication and session states securely (e.g. JWT vs. sessions)?",
      "Tell us about a time you deployed a full-stack application on the cloud (e.g. AWS, Docker) and managed its scaling."
    ];
  }
};

export default function JobList({ profile }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchLinks, setSearchLinks] = useState({ linkedin: '', naukri: '' });
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [platform, setPlatform] = useState('All');
  const [jobType, setJobType] = useState('All'); // "All", "Full-Time", "Internship"
  const [workType, setWorkType] = useState('All'); // "All", "Onsite", "Hybrid", "Remote"
  const [country, setCountry] = useState('All');
  const [city, setCity] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // Cover Letter Modal State
  const [activeCoverLetterJob, setActiveCoverLetterJob] = useState(null);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock Interview Modal State
  const [activeInterviewJob, setActiveInterviewJob] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewAnswers, setInterviewAnswers] = useState({ 0: '', 1: '', 2: '' });
  const [loadingInterviewEval, setLoadingInterviewEval] = useState(false);
  const [interviewEvaluation, setInterviewEvaluation] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/match-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        
        if (!response.ok) {
          throw new Error('Failed to retrieve matched jobs from backend.');
        }

        const data = await response.json();
        setJobs(data.matchedJobs || []);
        setSearchLinks(data.searchLinks || { linkedin: '', naukri: '' });
      } catch (err) {
        setError(err.message || 'Error fetching matching jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [profile]);

  // Reset pagination and child filters when parent filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, minScore, platform, jobType, workType, country, city]);

  // Reset city filter if country changes
  useEffect(() => {
    setCity('All');
  }, [country]);

  if (loading) {
    return (
      <div className="glass-panel loader-container">
        <div className="spinner"></div>
        <div className="loading-steps">Computing skill alignments and match metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel no-results" style={{ color: 'var(--danger)' }}>
        ⚠️ Error: {error}
      </div>
    );
  }

  // Cover Letter trigger
  const handleTriggerCoverLetter = async (job) => {
    setActiveCoverLetterJob(job);
    setLoadingCoverLetter(true);
    setCoverLetterText('');
    setCopied(false);
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, job })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCoverLetterText(data.coverLetter);
    } catch (err) {
      setCoverLetterText(`Error generating cover letter: ${err.message}`);
    } finally {
      setLoadingCoverLetter(false);
    }
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCoverLetter = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetterText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `CoverLetter_${activeCoverLetterJob.company.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Mock Interview trigger
  const handleTriggerInterview = (job) => {
    setActiveInterviewJob(job);
    const questions = getMockInterviewQuestions(job);
    setInterviewQuestions(questions);
    setInterviewAnswers({ 0: '', 1: '', 2: '' });
    setInterviewEvaluation(null);
    setLoadingInterviewEval(false);
  };

  const handleAnswerChange = (index, value) => {
    setInterviewAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleSubmitInterview = async () => {
    setLoadingInterviewEval(true);
    try {
      const qas = interviewQuestions.map((q, idx) => ({
        question: q,
        answer: interviewAnswers[idx] || ''
      }));

      const response = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: activeInterviewJob, QAs: qas })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInterviewEvaluation(data);
    } catch (err) {
      alert(`Error evaluating interview: ${err.message}`);
    } finally {
      setLoadingInterviewEval(false);
    }
  };

  // Extract unique countries
  const uniqueCountries = ['All', ...new Set(jobs.map(job => job.country).filter(Boolean))];

  // Extract unique cities (filtered dynamically by selected country)
  const filteredCitiesSource = country === 'All' 
    ? jobs 
    : jobs.filter(job => job.country === country);
  const uniqueCities = ['All', ...new Set(filteredCitiesSource.map(job => job.city).filter(Boolean))];

  // Filtering Pipeline
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesScore = job.matchDetails.score >= minScore;
    const matchesPlatform = platform === 'All' || job.source === platform;
    const matchesType = jobType === 'All' || job.type === jobType;
    const matchesWorkType = workType === 'All' || job.workType === workType;
    const matchesCountry = country === 'All' || job.country === country;
    const matchesCity = city === 'All' || job.city === city;

    return matchesSearch && matchesScore && matchesPlatform && matchesType && matchesWorkType && matchesCountry && matchesCity;
  });

  // DE-DUPLICATION: Keep only the highest-scoring job for each company + title combination
  const deduplicatedJobs = [];
  const seenJobKeys = new Set();

  filteredJobs.forEach(job => {
    const key = `${job.company.toLowerCase()}|${job.title.toLowerCase()}`;
    if (!seenJobKeys.has(key)) {
      seenJobKeys.add(key);
      deduplicatedJobs.push(job);
    }
  });

  // Pagination Logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = deduplicatedJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(deduplicatedJobs.length / jobsPerPage);

  const getScoreClass = (score) => {
    if (score >= 80) return 'match-high';
    if (score >= 55) return 'match-mid';
    return 'match-low';
  };

  return (
    <div className="job-results-container">

      {/* Filter Toolbar */}
      <div className="glass-panel search-filter-panel">
        
        {/* Job Type Toggle Bar (Full-Time vs. Internship) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(0, 0, 0, 0.25)', 
            padding: '4px', 
            borderRadius: '50px', 
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {[
              { id: 'All', label: '💼 All Offers' },
              { id: 'Full-Time', label: '👔 Full-Time Jobs' },
              { id: 'Internship', label: '🎓 Internships' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setJobType(t.id)}
                style={{
                  background: jobType === t.id ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          className="search-box"
          placeholder="Search by Job Title, Company, or Skill (e.g. React, Python)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="filter-row">
          {/* Match Score Filter */}
          <div className="filter-item">
            <label className="filter-label">Min Match Score</label>
            <select 
              className="filter-select" 
              value={minScore} 
              onChange={(e) => setMinScore(Number(e.target.value))}
            >
              <option value={0}>All Scores</option>
              <option value={80}>Super Match (80%+)</option>
              <option value={60}>Good Match (60%+)</option>
              <option value={40}>Medium Match (40%+)</option>
            </select>
          </div>



          {/* Work Mode Filter (Onsite, Hybrid, Remote) */}
          <div className="filter-item">
            <label className="filter-label">Work Mode</label>
            <select 
              className="filter-select" 
              value={workType} 
              onChange={(e) => setWorkType(e.target.value)}
            >
              <option value="All">All Modes</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Country Filter */}
          <div className="filter-item">
            <label className="filter-label">Country</label>
            <select 
              className="filter-select" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)}
            >
              {uniqueCountries.map((c, index) => (
                <option key={index} value={c}>{c === 'All' ? 'All Countries' : c}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="filter-item">
            <label className="filter-label">City</label>
            <select 
              className="filter-select" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              disabled={uniqueCities.length <= 1}
            >
              {uniqueCities.map((c, index) => (
                <option key={index} value={c}>{c === 'All' ? 'All Cities' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Found {deduplicatedJobs.length} unique matching options ({jobs.length} total indexed)
      </div>

      {/* Job Card List */}
      <div className="jobs-list">
        {currentJobs.length > 0 ? (
          currentJobs.map((job) => (
            <div key={job.id} className="glass-panel job-card">
              
              {/* Left Score Column */}
              <div className={`match-score-badge ${getScoreClass(job.matchDetails.score)}`}>
                <span className="score-num">{job.matchDetails.score}%</span>
                <span className="score-lbl">Match</span>
              </div>

              {/* Middle Info Column */}
              <div className="job-info">
                <div className="job-title-row">
                  <h3 className="job-title">{job.title}</h3>
                  <span className="company-name">@ {job.company}</span>
                </div>
                
                <div className="job-meta-row">
                  <div className="job-meta-item">
                    <span>📍</span> {job.city}, {job.country} ({job.workType})
                  </div>
                  <div className="job-meta-item">
                    <span>💼</span> {job.type}
                  </div>
                  <div className="job-meta-item">
                    <span>📈</span> {job.experienceLevel}
                  </div>
                  <div className="job-meta-item">
                    <span>💰</span> {job.salary}
                  </div>
                </div>

                <div className="job-tags">
                  {job.requirements.map((req, idx) => (
                    <span 
                      key={idx} 
                      className={`tag ${job.matchDetails.matchedSkills.includes(req) ? 'primary' : ''}`}
                      style={{ 
                        opacity: job.matchDetails.matchedSkills.includes(req) ? 1 : 0.6,
                        borderStyle: job.matchDetails.matchedSkills.includes(req) ? 'solid' : 'dashed'
                      }}
                    >
                      {req}
                    </span>
                  ))}
                </div>

                {/* Match Details Section */}
                <div className="match-details-container">
                  <div className="match-details-title">AI Compatibility Analysis:</div>
                  <div className="pros-cons-grid">
                    {job.matchDetails.pros.map((pro, idx) => (
                      <div key={idx} className="pro-item">
                        <span>✔</span> <span>{pro}</span>
                      </div>
                    ))}
                    {job.matchDetails.cons.map((con, idx) => (
                      <div key={idx} className="con-item">
                        <span>⚠</span> <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Gap Analysis & Learning Links */}
                {job.matchDetails.missingSkills.length > 0 && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📚 <strong>Skills Gap Learning Resources:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {job.matchDetails.missingSkills.map((skill, idx) => (
                        <a 
                          key={idx}
                          href={`https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}+tutorial`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tag"
                          style={{ borderColor: 'var(--warning)', color: 'var(--warning)', cursor: 'pointer' }}
                        >
                          Learn {skill} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Action Column */}
              <div className="job-actions" style={{ minWidth: '150px' }}>
                <span className="platform-badge linkedin">
                  LinkedIn
                </span>
                <a 
                  href={job.applyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-apply"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Apply Now ↗
                </a>
                <button
                  className="btn-secondary-action"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem', justifyContent: 'center' }}
                  onClick={() => handleTriggerCoverLetter(job)}
                >
                  📝 Cover Letter
                </button>
                <button
                  className="btn-secondary-action"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem', justifyContent: 'center' }}
                  onClick={() => handleTriggerInterview(job)}
                >
                  🎙️ Mock Interview
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="glass-panel no-results">
            🔍 No jobs match your current search filters. Try adjusting your sliders or search criteria.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn-page" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              className={`btn-page ${currentPage === idx + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          
          <button 
            className="btn-page" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
        </div>
      )}

      {/* --- COVER LETTER GENERATOR MODAL --- */}
      {activeCoverLetterJob && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>📝 Draft Cover Letter</h3>
              <button className="modal-close-btn" onClick={() => setActiveCoverLetterJob(null)}>✖</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Customized for <strong>{activeCoverLetterJob.title}</strong> at <strong>{activeCoverLetterJob.company}</strong> based on your technical skill profile.
              </p>
              
              {loadingCoverLetter ? (
                <div className="loader-container" style={{ padding: '2rem 0' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                  <div className="loading-steps" style={{ fontSize: '0.9rem' }}>DeepSeek drafting cover letter...</div>
                </div>
              ) : (
                <pre className="coverletter-pre">{coverLetterText}</pre>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setActiveCoverLetterJob(null)}>Close</button>
              <button 
                className="btn-apply" 
                onClick={handleCopyCoverLetter}
                disabled={loadingCoverLetter}
              >
                {copied ? '✅ Copied!' : '📋 Copy Clipboard'}
              </button>
              <button 
                className="btn-apply" 
                style={{ background: 'var(--secondary)' }} 
                onClick={handleDownloadCoverLetter}
                disabled={loadingCoverLetter}
              >
                💾 Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MOCK INTERVIEW PRACTICE MODAL --- */}
      {activeInterviewJob && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>🎙️ AI Mock Interview Practice</h3>
              <button className="modal-close-btn" onClick={() => setActiveInterviewJob(null)}>✖</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Practice interview questions matching <strong>{activeInterviewJob.title}</strong> at <strong>{activeInterviewJob.company}</strong>. Submit your answers below to let the AI score them.
              </p>

              {loadingInterviewEval ? (
                <div className="loader-container" style={{ padding: '3rem 0' }}>
                  <div className="spinner"></div>
                  <div className="loading-steps">AI Coach grading answers and compiling feedback...</div>
                </div>
              ) : interviewEvaluation ? (
                // Evaluation Review Screen
                <div>
                  <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Practice Rating Score</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>{interviewEvaluation.summary}</p>
                    </div>
                    <div className="match-score-badge match-high" style={{ width: '75px', height: '75px' }}>
                      <span className="score-num">{interviewEvaluation.overallRating}%</span>
                      <span className="score-lbl">Score</span>
                    </div>
                  </div>

                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Questions Evaluated:</h4>
                  {interviewEvaluation.evaluations.map((evalItem, idx) => (
                    <div key={idx} className="interview-qa-item" style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                      <div className="interview-question" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Q{idx + 1}: {evalItem.question}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>Your Answer: "{evalItem.answer || 'No answer provided'}"</div>
                      <div className="interview-feedback-block passed">
                        <div className="feedback-section-title" style={{ color: 'var(--success)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Score: {evalItem.score}/10</span>
                        </div>
                        <div style={{ color: 'var(--text-body)', marginBottom: '0.4rem' }}>{evalItem.feedback}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>💡 <strong>Coach Suggestion:</strong> {evalItem.suggestedImprovement}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Answer Entry Screen
                <div>
                  {interviewQuestions.map((q, idx) => (
                    <div key={idx} className="interview-qa-item">
                      <div className="interview-question">Question {idx + 1}: {q}</div>
                      <textarea
                        className="interview-textarea"
                        placeholder="Type your response here..."
                        value={interviewAnswers[idx] || ''}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary-action" 
                onClick={() => {
                  if (interviewEvaluation) {
                    setInterviewEvaluation(null); // Go back to answers
                  } else {
                    setActiveInterviewJob(null);
                  }
                }}
              >
                {interviewEvaluation ? 'Back to Edit' : 'Cancel'}
              </button>
              
              {!interviewEvaluation && (
                <button 
                  className="btn-apply" 
                  onClick={handleSubmitInterview}
                  disabled={loadingInterviewEval}
                >
                  🚀 Submit Answers for Grading
                </button>
              )}
              
              {interviewEvaluation && (
                <button 
                  className="btn-apply" 
                  onClick={() => setActiveInterviewJob(null)}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
