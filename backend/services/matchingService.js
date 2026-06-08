import { jobDatabase } from './jobDatabase.js';

/**
 * Computes matches between user resume profile and the mock job database.
 * Also generates pre-filled LinkedIn and Naukri search URLs for the user's profile.
 * 
 * Uses a strict "Senior Recruiter" grading model:
 * 1. Checks years of experience/level in job title. Freshers applying to Senior/Lead/Eng-II roles get crushed under 20%.
 * 2. Freshers applying to FAANG (Google, Amazon, Meta, Microsoft, Netflix) get crushed under 40% unless they have world-class prior internships.
 * 3. 70%+ scores are reserved only for highly realistic match potentials (e.g., startups or companies matching their background).
 * 
 * @param {object} profile Parsed resume profile 
 * @returns {object} { matchedJobs: Array, searchLinks: Object }
 */
export function matchJobs(profile) {
  const userSkills = (profile.skills || []).map(s => s.toLowerCase());
  const userRoles = (profile.targetRoles || []).map(r => r.toLowerCase());
  const userExp = profile.experienceLevel || 'Entry Level';

  // Recruiter profile analysis: Is the candidate a fresher or student?
  const isFresher = userExp === 'Internship' || userExp === 'Entry Level';
  
  // Did they complete prior internships (from resume text / summary)?
  const hasPriorInternships = 
    profile.summary && 
    (profile.summary.toLowerCase().includes('intern') || 
     profile.summary.toLowerCase().includes('developer intern') ||
     profile.summary.toLowerCase().includes('techstart') || 
     profile.summary.toLowerCase().includes('cloudsoft') ||
     profile.summary.toLowerCase().includes('innovate studio'));

  const matchedJobs = jobDatabase.map(job => {
    const jobReqs = (job.requirements || []).map(r => r.toLowerCase());
    const jobTitleLower = job.title.toLowerCase();
    
    // Check if the job requires Senior/Lead experience
    const isSeniorJob = 
      jobTitleLower.includes('senior') || 
      jobTitleLower.includes('sr.') || 
      jobTitleLower.includes('lead') || 
      jobTitleLower.includes('architect') || 
      jobTitleLower.includes('manager') || 
      jobTitleLower.includes('director') || 
      jobTitleLower.includes('eng ii') || 
      jobTitleLower.includes('ii') || 
      jobTitleLower.includes('iii') || 
      job.experienceLevel === 'Senior';

    // Check if the company is a FAANG equivalent
    const isFaang = ['Google', 'Microsoft', 'Meta', 'Amazon', 'Netflix'].includes(job.company);

    // 1. Skill overlap score (60%)
    let matchedSkills = [];
    let missingSkills = [];
    
    jobReqs.forEach(req => {
      const isMatch = userSkills.some(skill => 
        skill === req || 
        skill.includes(req) || 
        req.includes(skill)
      );

      if (isMatch) {
        matchedSkills.push(job.requirements[jobReqs.indexOf(req)]);
      } else {
        missingSkills.push(job.requirements[jobReqs.indexOf(req)]);
      }
    });

    const skillScore = jobReqs.length > 0 
      ? (matchedSkills.length / jobReqs.length) * 60 
      : 40;

    // 2. Title/Role match score (30%)
    let roleScore = 0;
    const directRoleMatch = userRoles.some(role => jobTitleLower.includes(role));
    if (directRoleMatch) {
      roleScore = 30;
    } else {
      const titleWords = jobTitleLower.split(/\s+/);
      const matchedWords = userRoles.some(role => {
        const roleWords = role.split(/\s+/);
        return roleWords.some(rw => titleWords.includes(rw) && rw.length > 3);
      });
      if (matchedWords) {
        roleScore = 15;
      }
    }

    // 3. Experience level match score (10%)
    let expScore = 0;
    const jobExp = job.experienceLevel;

    if (userExp === jobExp) {
      expScore = 10;
    } else if (
      (userExp === 'Internship' && jobExp === 'Entry Level') ||
      (userExp === 'Entry Level' && jobExp === 'Internship') ||
      (userExp === 'Entry Level' && jobExp === 'Mid Level') ||
      (userExp === 'Mid Level' && jobExp === 'Entry Level') ||
      (userExp === 'Mid Level' && jobExp === 'Senior') ||
      (userExp === 'Senior' && jobExp === 'Mid Level')
    ) {
      expScore = 5;
    }

    // Base calculation
    let totalScore = Math.round(skillScore + roleScore + expScore);

    // Generate Recruiter Pros and Cons
    const pros = [];
    const cons = [];

    if (matchedSkills.length > 0) {
      pros.push(`You match critical skills: ${matchedSkills.slice(0, 3).join(', ')}.`);
    }
    if (roleScore === 30) {
      pros.push(`Fits your preferred role target: "${job.title}".`);
    }
    if (userExp === jobExp) {
      pros.push(`Experience level matches perfectly (${jobExp}).`);
    }

    if (missingSkills.length > 0) {
      cons.push(`Missing requirements: ${missingSkills.slice(0, 3).join(', ')}.`);
    }

    // --- SENIOR RECRUITER PENALTY RULES ---
    let recruiterAuditApplied = false;

    // Rule 1: Freshers applying to Senior/Lead/Experienced Roles
    if (isFresher && isSeniorJob) {
      // Crush score under 20%
      totalScore = Math.round(8 + Math.random() * 10); // 8% - 18%
      cons.push(`Recruiter Audit: Auto-Reject. Candidate is an entry-level fresher, but this role requires senior execution or leadership.`);
      recruiterAuditApplied = true;
    }
    // Rule 2: Freshers applying to FAANG Companies
    else if (isFresher && isFaang) {
      if (!hasPriorInternships) {
        // Crush score under 40% (No prior internships)
        totalScore = Math.round(22 + Math.random() * 15); // 22% - 37%
        cons.push(`Recruiter Audit: Heavily Penalized. FAANG roles require prior world-class internships or elite academic records for freshers.`);
      } else {
        // Prior internship exists: Capped under 65% due to high FAANG selection pools
        totalScore = Math.min(64, totalScore);
        cons.push(`Recruiter Audit: Capped Match. Prior internship matches, but FAANG selection standards are extremely competitive.`);
      }
      recruiterAuditApplied = true;
    }
    // Rule 3: Realistic Entry-Level Scoring (70%+)
    else if (isFresher && totalScore >= 70) {
      // Only startups or mid-tier companies get 70%+ score
      const isStartupOrMidTier = !isFaang;
      const isJuniorOrInternRole = !isSeniorJob;
      const hasExcellentSkills = matchedSkills.length / jobReqs.length >= 0.8;

      if (isStartupOrMidTier && isJuniorOrInternRole && hasExcellentSkills) {
        // Allow the high score!
        pros.push(`Recruiter Audit: Excellent match! Highly realistic entry-level position at a scaling startup/company.`);
      } else {
        // Cap the score at 68%
        totalScore = 68;
        cons.push(`Recruiter Audit: Capped at 68%. Minor mismatch in company tier, skills overlap, or role level for realistic entry.`);
      }
      recruiterAuditApplied = true;
    }

    if (!recruiterAuditApplied && totalScore >= 75) {
      pros.push(`Recruiter Audit: Strong profile match for this job grade.`);
    }

    return {
      ...job,
      matchDetails: {
        score: Math.min(100, Math.max(5, totalScore)), // clamp between 5 and 100
        matchedSkills,
        missingSkills,
        pros: pros.length > 0 ? pros : ['Standard matches found.'],
        cons: cons.length > 0 ? cons : ['No major gaps detected.']
      }
    };
  });

  // Sort by match score descending
  const sortedJobs = matchedJobs.sort((a, b) => b.matchDetails.score - a.matchDetails.score);

  // Generate general pre-filled direct search URLs for LinkedIn and Naukri.com
  const primaryRole = profile.targetRoles[0] || 'Software Engineer';
  const querySkills = profile.skills.slice(0, 3).join(' ');

  const searchLinks = {
    linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(primaryRole + ' ' + querySkills)}`,
    naukri: `https://www.naukri.com/${encodeURIComponent(primaryRole.toLowerCase().replace(/\s+/g, '-'))}-jobs?k=${encodeURIComponent(profile.skills.slice(0, 4).join(', '))}`
  };

  return {
    matchedJobs: sortedJobs,
    searchLinks
  };
}
