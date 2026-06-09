import React, { useState } from 'react';
import { getApiUrl } from '../config';

export default function Dashboard({ profile, onProfileUpdate, onReset }) {
  const { name, email, phone, skills, targetRoles, experienceLevel, summary, atsScore, atsFeedback } = profile;
  const [newSkill, setNewSkill] = useState('');
  const [editingTargetRoles, setEditingTargetRoles] = useState(targetRoles ? targetRoles.join(', ') : '');
  
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

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      onProfileUpdate({
        ...profile,
        skills: updatedSkills
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    onProfileUpdate({
      ...profile,
      skills: updatedSkills
    });
  };

  const handleRolesBlurOrSubmit = () => {
    const rolesArray = editingTargetRoles
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);
    
    onProfileUpdate({
      ...profile,
      targetRoles: rolesArray
    });
  };

  const handleFieldChange = (field, value) => {
    onProfileUpdate({
      ...profile,
      [field]: value
    });
  };

  const getAtsClass = (score) => {
    if (score >= 80) return 'ats-score-high';
    if (score >= 50) return 'ats-score-mid';
    return 'ats-score-low';
  };

  return (
    <div className="glass-panel profile-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Profile Info Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="profile-avatar" style={{ margin: 0 }}>
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h2 className="profile-name" style={{ fontSize: '1.2rem' }}>{name || 'Developer'}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resume Profile</span>
        </div>
      </div>

      <p className="profile-summary" style={{ margin: 0, paddingBottom: '0.75rem' }}>{summary}</p>

      {/* Profile Details (Editable Fields) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {/* Target Roles Editor */}
        <div className="filter-item" style={{ minWidth: 'auto' }}>
          <label className="filter-label" style={{ fontSize: '0.7rem' }}>Target Job Roles</label>
          <input
            type="text"
            className="editable-input-field"
            value={editingTargetRoles}
            onChange={(e) => setEditingTargetRoles(e.target.value)}
            onBlur={handleRolesBlurOrSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleRolesBlurOrSubmit()}
            placeholder="e.g. React Developer, Software Engineer"
          />
        </div>

        {/* Experience level dropdown */}
        <div className="filter-item" style={{ minWidth: 'auto' }}>
          <label className="filter-label" style={{ fontSize: '0.7rem' }}>Experience Tier</label>
          <select
            className="editable-input-field"
            value={experienceLevel || 'Entry Level'}
            onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
          >
            <option value="Internship">Internship</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        {/* Contact Info (displays details) */}
        {(email || phone) && (
          <div style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-body)' }}>
            {email && <div style={{ wordBreak: 'break-all', marginBottom: '0.25rem' }}>📧 {email}</div>}
            {phone && <div>📞 {phone}</div>}
          </div>
        )}
      </div>

      {/* Extracted Skills List & Builder */}
      <div>
        <label className="filter-label" style={{ fontSize: '0.7rem' }}>Technical Skills</label>
        
        <div className="skills-editor-input-group">
          <input
            type="text"
            className="skills-editor-input"
            placeholder="Add new skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
          />
          <button className="btn-tag-add" onClick={handleAddSkill}>Add</button>
        </div>

        <div className="tag-cloud" style={{ marginTop: '0.5rem' }}>
          {skills && skills.map((skill, index) => (
            <span 
              key={index} 
              className="tag primary tag-interactive"
              onClick={() => handleRemoveSkill(skill)}
              title="Click to remove skill"
            >
              {skill} <span className="tag-delete-icon">✖</span>
            </span>
          ))}
        </div>
      </div>

      {/* ATS Compatibility Scanner Section */}
      <div className="ats-container">
        <div className="ats-header">
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>ATS Compatibility</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score & Audit Feedback</span>
          </div>
          <div className={`ats-score-badge ${getAtsClass(atsScore || 60)}`}>
            <span style={{ fontSize: '1.2rem' }}>{atsScore || 60}</span>
            <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-0.1rem' }}>Score</span>
          </div>
        </div>

        <div className="ats-feedback-list">
          {atsFeedback && atsFeedback.map((fb, index) => (
            <div key={index} className={`ats-feedback-item ${fb.type || 'warning'}`}>
              {fb.message}
            </div>
          ))}
        </div>

        <button 
          onClick={handlePolishResume}
          className="btn-apply"
          style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.5rem', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', boxShadow: 'none' }}
        >
          ✨ Polish Resume with AI
        </button>
      </div>

      <button onClick={onReset} className="btn-danger-outline" style={{ marginTop: '0.5rem' }}>
        🔄 Upload Another Resume
      </button>

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
                          handleFieldChange('summary', polishedData.polishedSummary);
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
                          const isAlreadyAdded = skills.includes(skill);
                          return (
                            <button
                              key={idx}
                              disabled={isAlreadyAdded}
                              onClick={() => {
                                const updatedSkills = [...skills, skill];
                                onProfileUpdate({ ...profile, skills: updatedSkills });
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
