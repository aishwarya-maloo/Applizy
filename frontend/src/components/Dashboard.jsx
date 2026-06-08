import React, { useState } from 'react';

export default function Dashboard({ profile, onProfileUpdate, onReset }) {
  const { name, email, phone, skills, targetRoles, experienceLevel, summary, atsScore, atsFeedback } = profile;
  const [newSkill, setNewSkill] = useState('');
  const [editingTargetRoles, setEditingTargetRoles] = useState(targetRoles ? targetRoles.join(', ') : '');

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
      </div>

      <button onClick={onReset} className="btn-danger-outline" style={{ marginTop: '0.5rem' }}>
        🔄 Upload Another Resume
      </button>

    </div>
  );
}
