import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';
import { getApiUrl } from './config';

const LOADING_MESSAGES = [
  'Extracting resume PDF characters...',
  'Analyzing syntax and layouts...',
  'Connecting with DeepSeek AI models...',
  'Extracting technical skill architectures...',
  'Synthesizing target job roles...',
  'Evaluating 100+ matching vacancies...',
  'Building direct query platforms links...'
];

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Resume polishing states
  const [showPolishModal, setShowPolishModal] = useState(false);
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishedData, setPolishedData] = useState(null);
  const [polishError, setPolishError] = useState(null);

  const handlePolishResume = async () => {
    setShowPolishModal(true);
    setPolishLoading(true);
    setPolishError(null);
    try {
      const response = await fetch(getApiUrl('/api/polish-resume'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to polish resume.');
      }
      setPolishedData(data);
    } catch (err) {
      setPolishError(err.message || 'An error occurred during resume polishing.');
    } finally {
      setPolishLoading(false);
    }
  };

  // Apply Light/Dark Theme Class to Body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Rotate loading messages for a premium interactive feel
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleUploadStart = () => {
    setLoading(true);
    setLoadingMsgIdx(0);
    setError(null);
  };

  const handleUploadSuccess = (parsedProfile) => {
    setProfile(parsedProfile);
    setLoading(false);
  };

  const handleUploadError = (errMsg) => {
    setError(errMsg);
    setLoading(false);
  };

  const handleReset = () => {
    setProfile(null);
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 8px var(--glow-primary))' }}>
            <rect width="100" height="100" rx="30" fill="url(#logo-grad)" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="54" fontFamily="Outfit" fontWeight="800">T</text>
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--secondary)" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.45rem' }}>Talentry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn-theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <div className="theme-badge">
            ✨ DeepSeek AI Driven
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {loading ? (
          // Parsing Loader View
          <div className="glass-panel loader-container" style={{ maxWidth: '600px', margin: '4rem auto' }}>
            <div className="spinner"></div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Analyzing Resume</h2>
            <p className="loading-steps">{LOADING_MESSAGES[loadingMsgIdx]}</p>
          </div>
        ) : !profile ? (
          // Landing/Upload View
          <div>
            <div className="hero-section">
              <h1>Find Your Ideal Job or Internship</h1>
              <p>
                Upload your resume, and let our DeepSeek-powered AI instantly map your skills, experience, and profile details to 50+ matching opportunities on LinkedIn and Naukri.com.
              </p>
            </div>
            
            {error && (
              <div 
                className="glass-panel" 
                style={{ 
                  maxWidth: '750px', 
                  margin: '0 auto 1.5rem auto', 
                  borderColor: 'var(--danger)', 
                  color: 'var(--danger)',
                  padding: '1rem'
                }}
              >
                ⚠️ <strong>Upload Error:</strong> {error}
              </div>
            )}
            
            <UploadSection 
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>
        ) : (
          // Dashboard/Results View
          <div className="dashboard-grid">
            <Dashboard 
              profile={profile} 
              onProfileUpdate={setProfile} 
              onReset={handleReset} 
              onPolish={handlePolishResume}
            />
            <JobList profile={profile} />
          </div>
        )}
      </main>

      {/* --- AI RESUME POLISHING MODAL --- */}
      {showPolishModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✨ AI Resume Polisher
              </h3>
              <button className="modal-close-btn" onClick={() => setShowPolishModal(false)}>✖</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Senior-recruiter-grade optimizations to maximize ATS compatibility.
              </p>

              {polishLoading ? (
                <div className="loader-container" style={{ padding: '2rem 0' }}>
                  <div className="spinner"></div>
                  <div className="loading-steps">Polishing summary, experiences, and keyword layouts...</div>
                </div>
              ) : polishError ? (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', padding: '1rem', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                  ⚠️ {polishError}
                </div>
              ) : polishedData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                  
                  {/* Polished Summary */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>📝 Polished Summary</h4>
                      <button 
                        className="btn-apply"
                        onClick={() => {
                          setProfile({ ...profile, summary: polishedData.polishedSummary });
                          setShowPolishModal(false);
                        }}
                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', cursor: 'pointer', boxShadow: 'none' }}
                      >
                        Apply to Profile
                      </button>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-body)', lineHeight: '1.4' }}>
                      {polishedData.polishedSummary}
                    </div>
                  </div>

                  {/* Polished Bullet Points */}
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      📈 ATS-Optimized Experience Bullets
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: 0 }}>
                      Copy these metrics-focused bullets into your resume projects/experience:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {polishedData.polishedExperience && polishedData.polishedExperience.map((bullet, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.15)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-body)', position: 'relative' }}>
                          <span style={{ color: 'var(--secondary)' }}>•</span>
                          <span style={{ flex: 1, paddingRight: '1.5rem', lineHeight: '1.4' }}>{bullet}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(bullet);
                              alert('Copied to clipboard!');
                            }}
                            title="Copy to clipboard"
                            style={{ position: 'absolute', right: '0.5rem', top: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            📋
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Skills */}
                  {polishedData.recommendedSkills && polishedData.recommendedSkills.length > 0 && (
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        💡 Suggested Skills to Add
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: 0 }}>
                        Click a skill tag to instantly add it to your profile and boost your matching score:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {polishedData.recommendedSkills.map((skill, idx) => {
                          const isAlreadyAdded = profile.skills.includes(skill);
                          return (
                            <button
                              key={idx}
                              disabled={isAlreadyAdded}
                              onClick={() => {
                                const updatedSkills = [...profile.skills, skill];
                                setProfile({ ...profile, skills: updatedSkills });
                              }}
                              style={{
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.75rem',
                                borderRadius: '50px',
                                border: '1px solid',
                                borderColor: isAlreadyAdded ? 'var(--border-color)' : 'rgba(6, 182, 212, 0.3)',
                                backgroundColor: isAlreadyAdded ? 'rgba(255,255,255,0.02)' : 'rgba(6, 182, 212, 0.08)',
                                color: isAlreadyAdded ? 'var(--text-muted)' : 'var(--secondary)',
                                cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {skill} {isAlreadyAdded ? '✓' : '+'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary-action" onClick={() => setShowPolishModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
