// Local job database with programmatically generated realistic listings to guarantee 50+ unique options.

const COMPANIES = [
  { name: 'Google', domain: 'google.com' },
  { name: 'Microsoft', domain: 'microsoft.com' },
  { name: 'Meta', domain: 'meta.com' },
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'Razorpay', domain: 'razorpay.com' },
  { name: 'Swiggy', domain: 'swiggy.com' },
  { name: 'Zomato', domain: 'zomato.com' },
  { name: 'CRED', domain: 'cred.club' },
  { name: 'TCS', domain: 'tcs.com' },
  { name: 'Infosys', domain: 'infosys.com' },
  { name: 'Wipro', domain: 'wipro.com' },
  { name: 'Accenture', domain: 'accenture.com' },
  { name: 'Stripe', domain: 'stripe.com' },
  { name: 'Uber', domain: 'uber.com' },
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Paytm', domain: 'paytm.com' },
  { name: 'Ola Cabs', domain: 'ola.in' },
  { name: 'Flipkart', domain: 'flipkart.com' },
  { name: 'PhonePe', domain: 'phonepe.com' },
  { name: 'Canva', domain: 'canva.com' }
];

const LOCATIONS = [
  { city: 'Bengaluru', country: 'India', workType: 'Onsite' },
  { city: 'Hyderabad', country: 'India', workType: 'Hybrid' },
  { city: 'Pune', country: 'India', workType: 'Onsite' },
  { city: 'Noida', country: 'India', workType: 'Hybrid' },
  { city: 'Mumbai', country: 'India', workType: 'Onsite' },
  { city: 'Remote', country: 'India', workType: 'Remote' },
  { city: 'Remote', country: 'Global', workType: 'Remote' },
  { city: 'San Francisco', country: 'USA', workType: 'Onsite' },
  { city: 'London', country: 'UK', workType: 'Hybrid' },
  { city: 'New York', country: 'USA', workType: 'Hybrid' }
];

const JOB_TEMPLATES = [
  // 1. Frontend Developers
  {
    titles: ['Frontend Developer', 'Frontend Engineer', 'UI Developer', 'React Developer', 'Web Developer'],
    categories: ['frontend', 'web'],
    baseDescription: 'We are looking for a creative and passionate Frontend Engineer to join our product team. You will build highly interactive, responsive web applications and ensure seamless user experience.',
    requirements: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Tailwind', 'Redux', 'Git'],
    salaries: ['₹6,00,000 - ₹12,00,000 / year', '₹15,00,000 - ₹25,00,000 / year', '$110,000 - $140,000 / year']
  },
  // 2. Backend Developers
  {
    titles: ['Backend Developer', 'Backend Engineer', 'Node.js Developer', 'API Engineer', 'Software Engineer (Backend)'],
    categories: ['backend'],
    baseDescription: 'Seeking a robust Backend Developer to scale our database architectures, build secure microservices, and write high-performance APIs that power our core client services.',
    requirements: ['Node.js', 'Express', 'MongoDB', 'SQL', 'PostgreSQL', 'REST APIs', 'Python', 'AWS', 'Docker'],
    salaries: ['₹8,00,000 - ₹16,00,000 / year', '₹20,00,000 - ₹35,00,000 / year', '$120,000 - $160,000 / year']
  },
  // 3. Full Stack Developers
  {
    titles: ['Full Stack Developer', 'Full Stack Engineer', 'Software Engineer', 'MERN Stack Developer'],
    categories: ['fullstack', 'backend', 'frontend'],
    baseDescription: 'Looking for a versatile Full Stack Developer who can comfortably work across frontend UI layouts and backend services. You will own features from database design all the way to deployment.',
    requirements: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'SQL', 'AWS', 'Git'],
    salaries: ['₹10,00,000 - ₹18,00,000 / year', '₹22,00,000 - ₹40,00,000 / year', '$130,000 - $180,000 / year']
  },
  // 4. Data Science & Analytics
  {
    titles: ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Research Engineer'],
    categories: ['datascience', 'python'],
    baseDescription: 'Join our analytics team to extract deep insights from terabytes of user data, train state-of-the-art predictive models, and optimize our AI Recommendation systems.',
    requirements: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Analysis', 'Tableau'],
    salaries: ['₹9,00,000 - ₹15,00,000 / year', '₹25,00,000 - ₹45,00,000 / year', '$140,000 - $190,000 / year']
  },
  // 5. UI/UX Designers
  {
    titles: ['UI/UX Designer', 'Product Designer', 'Interaction Designer', 'Visual Designer'],
    categories: ['design', 'frontend'],
    baseDescription: 'We are seeking a Product Designer who lives and breathes human-centered design. You will turn complex user challenges into clean wireframes, high-fidelity mockups, and delightful interactions.',
    requirements: ['Figma', 'UI/UX', 'Wireframing', 'Prototyping', 'Adobe XD', 'HTML', 'CSS'],
    salaries: ['₹5,00,000 - ₹10,00,000 / year', '₹12,00,000 - ₹22,00,000 / year', '$90,000 - $130,000 / year']
  },
  // 6. Mobile Developers
  {
    titles: ['Mobile Developer', 'React Native Engineer', 'Android Developer', 'Flutter Developer', 'iOS Developer'],
    categories: ['mobile', 'frontend'],
    baseDescription: 'Help us build and maintain our mobile applications. You will collaborate on cross-functional teams to design, develop, test, and release robust apps used by millions.',
    requirements: ['React Native', 'Flutter', 'Kotlin', 'Java', 'Android SDK', 'Git', 'JavaScript'],
    salaries: ['₹7,00,000 - ₹13,00,000 / year', '₹18,00,000 - ₹30,00,000 / year', '$115,000 - $150,000 / year']
  }
];

/**
 * Generates unique job objects (at least 60+ unique entries out of 150 generation attempts)
 * to ensure that duplicates do not repeat.
 */
function generateMockJobs() {
  const jobs = [];
  const seen = new Set();
  let idCounter = 1;

  for (let i = 0; i < 150; i++) {
    const template = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    const company = COMPANIES[i % COMPANIES.length];
    const location = LOCATIONS[(i + 3) % LOCATIONS.length];
    
    // Distribute levels
    let experienceLevel = 'Entry Level';
    let type = 'Full-Time';
    if (i % 4 === 0) {
      experienceLevel = 'Internship';
      type = 'Internship';
    } else if (i % 7 === 0) {
      experienceLevel = 'Senior';
    } else if (i % 3 === 0) {
      experienceLevel = 'Mid Level';
    }

    const title = template.titles[i % template.titles.length] + 
      (experienceLevel === 'Internship' ? ' (Intern)' : (experienceLevel === 'Senior' ? ' (Senior)' : ''));

    // Prevent duplicate entries (same company, job title, and city)
    const uniqueKey = `${company.name.toLowerCase()}|${title.toLowerCase()}|${location.city.toLowerCase()}`;
    if (seen.has(uniqueKey)) {
      continue;
    }
    seen.add(uniqueKey);

    // Distribute salary
    let salaryIndex = 0;
    if (experienceLevel === 'Senior') salaryIndex = 1;
    else if (location.city === 'San Francisco' || location.city === 'New York' || location.country === 'Global') salaryIndex = 2;
    if (experienceLevel === 'Internship') {
      salaryIndex = -1; // Stipend
    }

    const salary = salaryIndex === -1 
      ? (location.country === 'India' ? '₹25,000 - ₹50,000 / month' : '$3,000 - $6,000 / month')
      : template.salaries[salaryIndex];

    const source = 'LinkedIn';

    // Create highly targeted apply URL that filters down to the exact company and role on LinkedIn
    const searchTerms = `${company.name} ${title}`;
    const applyUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchTerms)}`;

    // Build specific requirements (take base requirements and add/remove some for variance)
    const baseReqs = [...template.requirements];
    const requirements = [];
    const count = 4 + (i % 4); // 4 to 7 requirements
    for (let r = 0; r < count && baseReqs.length > 0; r++) {
      const idx = (i + r) % baseReqs.length;
      requirements.push(baseReqs.splice(idx, 1)[0]);
    }

    jobs.push({
      id: `job-${idCounter++}`,
      title,
      company: company.name,
      city: location.city,
      country: location.country,
      workType: location.workType,
      type,
      experienceLevel,
      description: `${template.baseDescription} Located at our ${location.city} office (${location.country}) as a ${location.workType} role. We offer competitive salaries, flexible working hours, health benefits, and a highly collaborative team culture.`,
      requirements,
      salary,
      source,
      applyUrl
    });
  }

  return jobs;
}

export const jobDatabase = generateMockJobs();
