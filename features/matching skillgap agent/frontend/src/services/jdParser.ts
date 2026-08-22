import { PlacementDrive, Branch, InterviewRoundConfig } from '../types/placement';

export const SAMPLE_JD_TEMPLATES = [
  {
    company: 'Amazon AWS',
    role: 'Cloud Software Engineer (SDE-1)',
    text: `Amazon Web Services (AWS) is hiring SDE-1 for our Cloud Infrastructure and Scalable Storage teams in Bangalore/Hyderabad.
Criteria:
- B.E / B.Tech in CSE, AI & DS, IT, or ECE with Minimum CGPA of 8.20 and 0 active backlogs.
- Strong proficiency in Java, C++, Distributed Systems, AWS/Cloud fundamentals, and Algorithms & Data Structures.
- Preferred skills: Docker, Kubernetes, DynamoDB, Microservices.
Compensation: 34.0 LPA (Base: 18L, Stock: 12L, Joining Bonus: 4L).
Selection Rounds:
1. Online Coding Assessment (90 mins - DSA & LeetCode Hard)
2. Technical Round 1: DSA & Problem Solving (60 mins)
3. Technical Round 2: Low-Level System Design & Concurrency (60 mins)
4. Bar Raiser & Amazon Leadership Principles (45 mins)`
  },
  {
    company: 'NVIDIA',
    role: 'AI / CUDA Systems Software Engineer',
    text: `NVIDIA is looking for passionate engineers to join our Accelerated Computing and Deep Learning platform team.
Requirements:
- Degrees: CSE, AI & DS, ECE, EEE. Minimum CGPA: 8.5, No active backlogs.
- Mandatory Skills: C++, CUDA, Python, PyTorch, Computer Architecture, GPU Optimization.
- Preferred: RTOS, Verilog, TensorRT, LLMs & Transformers.
Package: 42.0 LPA + Relocation & Stock options.
Process:
1. Technical MCQ & CUDA Coding Round (90 mins)
2. Deep Learning Systems & Hardware-Software Co-Design (60 mins)
3. C++ Performance Engineering & Memory Models (60 mins)
4. Managerial & Team Fit (45 mins)`
  },
  {
    company: 'Razorpay',
    role: 'FinTech Backend Platform Engineer',
    text: `Razorpay, India's leading fintech infrastructure company, is hiring graduate engineers.
Eligibility:
- B.Tech in CSE, IT, AI & DS, ECE. Minimum CGPA: 7.80. Max active backlogs: 0.
- Mandatory: Golang, Java, Spring Boot, MySQL/PostgreSQL, Microservices, Kafka.
- CTC: 26.0 LPA.
Rounds:
1. Machine Coding & API Design Challenge (120 mins)
2. Systems & Database Internals (60 mins)
3. Culture & Founders Fit Round (45 mins)`
  }
];

export function parseJobDescriptionText(text: string, defaultCompany = 'New Tech Corp'): Partial<PlacementDrive> {
  const lines = text.toLowerCase();
  
  // Extract CGPA
  let minCgpa = 7.5;
  const cgpaMatch = text.match(/(?:cgpa|gpa|cutoff|minimum cgpa)[\s:]*([0-9]+(?:\.[0-9]+)?)/i);
  if (cgpaMatch) {
    minCgpa = parseFloat(cgpaMatch[1]);
  }

  // Extract Backlogs
  let maxBacklogs = 0;
  if (/no\s+(?:active\s+)?backlogs|0\s+backlogs|zero\s+backlogs/i.test(text)) {
    maxBacklogs = 0;
  } else if (/max(?:imum)?\s*([0-9]+)\s*backlog/i.test(text)) {
    const match = text.match(/max(?:imum)?\s*([0-9]+)\s*backlog/i);
    if (match) maxBacklogs = parseInt(match[1]);
  }

  // Extract Branches
  const allowedBranches: Branch[] = [];
  if (lines.includes('cse') || lines.includes('computer science')) allowedBranches.push('CSE');
  if (lines.includes('ai') || lines.includes('data science') || lines.includes('ai & ds') || lines.includes('aiml')) allowedBranches.push('AI & DS');
  if (lines.includes('it') || lines.includes('information tech')) allowedBranches.push('IT');
  if (lines.includes('ece') || lines.includes('electronics')) allowedBranches.push('ECE');
  if (lines.includes('eee') || lines.includes('electrical')) allowedBranches.push('EEE');
  if (lines.includes('mech') || lines.includes('mechanical')) allowedBranches.push('MECH');

  if (allowedBranches.length === 0) {
    allowedBranches.push('CSE', 'AI & DS', 'IT');
  }

  // Extract CTC
  let ctc = '22.0 LPA';
  const ctcMatch = text.match(/(?:ctc|package|compensation|salary)[\s:]*([0-9]+(?:\.[0-9]+)?\s*(?:lpa|lakhs|l))/i);
  if (ctcMatch) {
    ctc = ctcMatch[1].toUpperCase();
  }

  // Extract Skills
  const potentialSkills = [
    'Algorithms & Data Structures', 'C++', 'Java', 'Python', 'Go', 'Golang', 'Rust',
    'PyTorch', 'TensorFlow', 'LLMs & Transformers', 'Distributed Systems', 'System Design',
    'React', 'TypeScript', 'Node.js', 'Spring Boot', 'Kafka', 'Docker', 'Kubernetes',
    'PostgreSQL', 'MySQL', 'Cloud Architecture (GCP/AWS)', 'CUDA', 'Embedded C', 'Verilog HDL'
  ];

  const mandatorySkills: string[] = [];
  const preferredSkills: string[] = [];

  potentialSkills.forEach(skill => {
    const skillPattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (skillPattern.test(text)) {
      if (mandatorySkills.length < 4) {
        mandatorySkills.push(skill);
      } else {
        preferredSkills.push(skill);
      }
    }
  });

  if (mandatorySkills.length === 0) {
    mandatorySkills.push('Algorithms & Data Structures', 'Python', 'C++');
  }

  // Extract Rounds
  const rounds: InterviewRoundConfig[] = [
    { roundNumber: 1, name: 'Online Coding Challenge', type: 'Coding', durationMinutes: 90, mode: 'Virtual' },
    { roundNumber: 2, name: 'Technical Round 1: DSA & Core CS', type: 'Technical', durationMinutes: 60, mode: 'Physical' },
    { roundNumber: 3, name: 'Technical Round 2: System Design & Architecture', type: 'System Design', durationMinutes: 60, mode: 'Physical' },
    { roundNumber: 4, name: 'HR & Cultural Alignment', type: 'HR', durationMinutes: 45, mode: 'Physical' }
  ];

  // Extract Role
  let role = 'Software Development Engineer';
  const roleMatch = text.match(/(?:hiring for|role|position|title)[\s:]*([a-zA-Z0-9\s&()\-–/]{4,50})/i);
  if (roleMatch && roleMatch[1].trim().length > 3) {
    role = roleMatch[1].trim().split('\n')[0];
  }

  return {
    companyName: defaultCompany,
    role,
    jobType: 'Full-Time',
    ctc,
    location: 'Bangalore / Remote',
    minCgpa,
    maxActiveBacklogs: maxBacklogs,
    allowedBranches,
    mandatorySkills,
    preferredSkills,
    description: text.slice(0, 500) + '...',
    rounds,
    status: 'Active',
    tags: ['AI Parsed', 'Campus Drive 2026', allowedBranches.join('/')]
  };
}
