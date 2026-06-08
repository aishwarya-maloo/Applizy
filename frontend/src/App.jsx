import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';

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
            <Dashboard profile={profile} onProfileUpdate={setProfile} onReset={handleReset} />
            <JobList profile={profile} />
          </div>
        )}
      </main>
    </div>
  );
}
