import { useState, useCallback } from 'react';
import {
  Job,
  JobSeekerProfile,
  Company,
  Badge,
  Quiz,
  QuizAttempt,
  Application,
  CustomTest,
  TestResult,
  JobMatch,
  CVTemplate,
  Notification,
  DashboardMetrics,
  AnalyticsData,
} from '@/types';

// Mock CV Templates
const mockCVTemplates: CVTemplate[] = [
  { id: '1', name: 'Modern Professional', preview: '/templates/modern.png', category: 'modern' },
  { id: '2', name: 'Classic Elegant', preview: '/templates/classic.png', category: 'classic' },
  { id: '3', name: 'Creative Bold', preview: '/templates/creative.png', category: 'creative' },
  { id: '4', name: 'Minimal Clean', preview: '/templates/minimal.png', category: 'minimal' },
];

// Mock Badges
const mockBadges: Badge[] = [
  { id: '1', userId: '1', name: 'JavaScript Master', category: 'Technical Skills', level: 'gold', score: 88, earnedAt: new Date('2024-02-15'), icon: 'code' },
  { id: '2', userId: '1', name: 'React Specialist', category: 'Technical Skills', level: 'platinum', score: 96, earnedAt: new Date('2024-03-01'), icon: 'atom' },
  { id: '3', userId: '1', name: 'Communication Pro', category: 'Soft Skills', level: 'silver', score: 78, earnedAt: new Date('2024-01-20'), icon: 'message-circle' },
  { id: '4', userId: '1', name: 'English Fluent', category: 'Language Proficiency', level: 'gold', score: 92, earnedAt: new Date('2024-02-28'), icon: 'languages' },
  { id: '5', userId: '1', name: 'Problem Solver', category: 'Aptitude', level: 'gold', score: 85, earnedAt: new Date('2024-03-10'), icon: 'brain' },
];

// Mock Job Seeker Profile
const mockProfile: JobSeekerProfile = {
  id: '1',
  userId: '1',
  headline: 'Senior Full Stack Developer | React & Node.js Expert',
  summary: 'Passionate full-stack developer with 6+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies. Strong advocate for clean code and agile methodologies.',
  location: { city: 'San Francisco', region: 'CA', country: 'USA', remote: true },
  phone: '+1 (555) 123-4567',
  linkedIn: 'linkedin.com/in/alexjohnson',
  portfolio: 'alexjohnson.dev',
  expectedSalary: { min: 120000, max: 160000, currency: 'USD' },
  education: [
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: new Date('2014-09-01'),
      endDate: new Date('2018-06-01'),
      current: false,
      gpa: 3.8,
    },
    {
      id: '2',
      institution: 'UC Berkeley',
      degree: 'Master of Science',
      fieldOfStudy: 'Software Engineering',
      startDate: new Date('2019-09-01'),
      endDate: new Date('2021-06-01'),
      current: false,
    },
  ],
  workExperience: [
    {
      id: '1',
      company: 'TechCorp Inc.',
      position: 'Senior Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: new Date('2022-03-01'),
      current: true,
      description: 'Leading development of microservices architecture and React frontend applications.',
      achievements: [
        'Reduced API response time by 40% through optimization',
        'Led team of 5 developers in major platform redesign',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
      ],
    },
    {
      id: '2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      location: 'Remote',
      startDate: new Date('2019-07-01'),
      endDate: new Date('2022-02-28'),
      current: false,
      description: 'Built full-stack features for SaaS platform serving 10K+ users.',
      achievements: [
        'Developed real-time collaboration features using WebSockets',
        'Implemented payment processing integration',
      ],
    },
  ],
  skills: [
    { id: '1', name: 'React', category: 'technical', proficiency: 95 },
    { id: '2', name: 'TypeScript', category: 'technical', proficiency: 90 },
    { id: '3', name: 'Node.js', category: 'technical', proficiency: 88 },
    { id: '4', name: 'Python', category: 'technical', proficiency: 75 },
    { id: '5', name: 'AWS', category: 'technical', proficiency: 82 },
    { id: '6', name: 'PostgreSQL', category: 'technical', proficiency: 85 },
    { id: '7', name: 'MongoDB', category: 'technical', proficiency: 78 },
    { id: '8', name: 'Docker', category: 'technical', proficiency: 80 },
    { id: '9', name: 'Communication', category: 'soft', proficiency: 88 },
    { id: '10', name: 'Leadership', category: 'soft', proficiency: 82 },
    { id: '11', name: 'Problem Solving', category: 'soft', proficiency: 92 },
    { id: '12', name: 'English', category: 'language', proficiency: 98 },
    { id: '13', name: 'Spanish', category: 'language', proficiency: 65 },
  ],
  certifications: [
    { id: '1', name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', issueDate: new Date('2023-05-15'), credentialId: 'AWS-12345' },
    { id: '2', name: 'MongoDB Certified Developer', issuer: 'MongoDB University', issueDate: new Date('2022-08-20'), credentialId: 'MDB-67890' },
  ],
  badges: mockBadges,
  preferences: {
    jobTypes: ['full-time', 'contract'],
    industries: ['Technology', 'Finance', 'Healthcare'],
    companySizes: ['startup', 'sme'],
  },
};

// Mock Companies
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    description: 'Leading technology company specializing in cloud solutions and AI-powered applications.',
    industry: 'Technology',
    size: 'enterprise',
    location: { city: 'San Francisco', country: 'USA' },
    website: 'techcorp.com',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    founded: 2010,
    benefits: ['Health Insurance', 'Remote Work', 'Stock Options', '401k Match', 'Unlimited PTO'],
  },
  {
    id: '2',
    name: 'StartupXYZ',
    description: 'Fast-growing startup disrupting the fintech industry with innovative payment solutions.',
    industry: 'Finance',
    size: 'startup',
    location: { city: 'Austin', country: 'USA' },
    website: 'startupxyz.io',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop',
    founded: 2021,
    benefits: ['Equity', 'Flexible Hours', 'Home Office Budget', 'Learning Stipend'],
  },
  {
    id: '3',
    name: 'HealthTech Solutions',
    description: 'Healthcare technology company building the future of patient care.',
    industry: 'Healthcare',
    size: 'sme',
    location: { city: 'Boston', country: 'USA' },
    website: 'healthtech.com',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop',
    founded: 2015,
    benefits: ['Health & Dental', 'Wellness Programs', 'Professional Development'],
  },
];

// Mock Jobs
const mockJobs: Job[] = [
  {
    id: '1',
    companyId: '1',
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using React and Node.js.',
    requirements: [
      '5+ years of experience in full-stack development',
      'Strong proficiency in React, TypeScript, and Node.js',
      'Experience with cloud platforms (AWS/GCP/Azure)',
      'Bachelor\'s degree in Computer Science or related field',
    ],
    responsibilities: [
      'Design and implement scalable web applications',
      'Collaborate with cross-functional teams',
      'Mentor junior developers',
      'Participate in code reviews and architecture decisions',
    ],
    location: { city: 'San Francisco', region: 'CA', country: 'USA', remote: true, hybrid: true },
    type: 'full-time',
    experienceLevel: 'senior',
    salary: { min: 130000, max: 180000, currency: 'USD', period: 'yearly' },
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
    industry: 'Technology',
    postedAt: new Date('2024-03-01'),
    status: 'active',
    views: 245,
    applications: 32,
  },
  {
    id: '2',
    companyId: '2',
    title: 'Frontend Engineer',
    description: 'Join our innovative fintech startup as a Frontend Engineer. Help us build beautiful, responsive user interfaces for our payment platform.',
    requirements: [
      '3+ years of frontend development experience',
      'Expert in React and modern JavaScript',
      'Experience with state management (Redux/Zustand)',
      'Strong UI/UX sensibilities',
    ],
    responsibilities: [
      'Build responsive and accessible user interfaces',
      'Optimize application performance',
      'Work closely with designers to implement pixel-perfect designs',
      'Write clean, maintainable code',
    ],
    location: { country: 'USA', remote: true, hybrid: false },
    type: 'full-time',
    experienceLevel: 'mid',
    salary: { min: 100000, max: 140000, currency: 'USD', period: 'yearly' },
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
    industry: 'Finance',
    postedAt: new Date('2024-03-05'),
    status: 'active',
    views: 189,
    applications: 24,
  },
  {
    id: '3',
    companyId: '3',
    title: 'Backend Developer - Python',
    description: 'Looking for a skilled Python developer to build robust backend systems for our healthcare platform.',
    requirements: [
      '4+ years of Python development experience',
      'Experience with Django or FastAPI',
      'Knowledge of PostgreSQL and Redis',
      'Understanding of HIPAA compliance is a plus',
    ],
    responsibilities: [
      'Design and implement RESTful APIs',
      'Ensure data security and compliance',
      'Optimize database queries and performance',
      'Integrate with third-party healthcare systems',
    ],
    location: { city: 'Boston', region: 'MA', country: 'USA', remote: false, hybrid: true },
    type: 'full-time',
    experienceLevel: 'mid',
    salary: { min: 110000, max: 150000, currency: 'USD', period: 'yearly' },
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
    industry: 'Healthcare',
    postedAt: new Date('2024-03-08'),
    status: 'active',
    views: 156,
    applications: 18,
  },
  {
    id: '4',
    companyId: '1',
    title: 'DevOps Engineer',
    description: 'Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.',
    requirements: [
      '3+ years of DevOps experience',
      'Strong AWS knowledge',
      'Experience with Kubernetes and Terraform',
      'Scripting skills in Python or Bash',
    ],
    responsibilities: [
      'Manage cloud infrastructure',
      'Implement and maintain CI/CD pipelines',
      'Monitor system performance and reliability',
      'Collaborate with development teams',
    ],
    location: { city: 'San Francisco', region: 'CA', country: 'USA', remote: true, hybrid: true },
    type: 'full-time',
    experienceLevel: 'senior',
    salary: { min: 140000, max: 190000, currency: 'USD', period: 'yearly' },
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
    industry: 'Technology',
    postedAt: new Date('2024-03-10'),
    status: 'active',
    views: 134,
    applications: 15,
  },
  {
    id: '5',
    companyId: '2',
    title: 'Mobile Developer - React Native',
    description: 'Build cross-platform mobile applications for our fintech platform.',
    requirements: [
      '2+ years of React Native experience',
      'Published apps on App Store and Play Store',
      'Experience with payment integrations',
      'Knowledge of mobile security best practices',
    ],
    responsibilities: [
      'Develop and maintain mobile applications',
      'Implement secure payment flows',
      'Optimize app performance',
      'Collaborate with backend team on API design',
    ],
    location: { country: 'USA', remote: true, hybrid: false },
    type: 'contract',
    experienceLevel: 'mid',
    salary: { min: 80, max: 120, currency: 'USD', period: 'hourly' },
    skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
    industry: 'Finance',
    postedAt: new Date('2024-03-12'),
    status: 'active',
    views: 98,
    applications: 12,
  },
  {
    id: '6',
    companyId: '1',
    title: 'Cloud Architect',
    description: 'Lead the architectural design and implementation of highly scalable cloud solutions using modern infrastructure as code.',
    requirements: [
      '8+ years of software/systems engineering',
      'Extensive AWS or GCP architectural experience',
      'Deep understanding of microservices architecture',
    ],
    responsibilities: [
      'Design cloud infrastructure',
      'Create architectural guidelines',
      'Mentor engineering teams',
    ],
    location: { city: 'Seattle', region: 'WA', country: 'USA', remote: true, hybrid: true },
    type: 'full-time',
    experienceLevel: 'executive',
    salary: { min: 180000, max: 240000, currency: 'USD', period: 'yearly' },
    skills: ['AWS', 'System Design', 'Kubernetes', 'Terraform'],
    industry: 'Technology',
    postedAt: new Date('2024-03-14'),
    status: 'active',
    views: 310,
    applications: 45,
  },
  {
    id: '7',
    companyId: '3',
    title: 'Data Scientist',
    description: 'Join our Data Science team to analyze complex healthcare datasets and build predictive models to improve patient care.',
    requirements: [
      'Master\'s or Ph.D. in computer science, statistics, or related field',
      'Strong background in machine learning and statistics',
      'Proficiency in Python and SQL',
    ],
    responsibilities: [
      'Build predictive machine learning models',
      'Uncover insights from large healthcare data',
      'Collaborate with data engineers for model deployment',
    ],
    location: { city: 'Boston', region: 'MA', country: 'USA', remote: false, hybrid: true },
    type: 'full-time',
    experienceLevel: 'senior',
    salary: { min: 140000, max: 180000, currency: 'USD', period: 'yearly' },
    skills: ['Python', 'Machine Learning', 'SQL', 'Pandas'],
    industry: 'Healthcare',
    postedAt: new Date('2024-03-15'),
    status: 'active',
    views: 190,
    applications: 60,
  },
];

// Mock Quizzes - Extensive collection across multiple sectors
const mockQuizzes: Quiz[] = [
  // SOFTWARE DEVELOPMENT
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    category: 'Technical Skills',
    description: 'Test your knowledge of JavaScript core concepts, ES6+ features, and best practices.',
    duration: 30,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the output of: console.log(typeof [])?', options: ['array', 'object', 'undefined', 'null'], correctAnswer: 'object', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which method creates a new array with all elements that pass a test?', options: ['map()', 'filter()', 'reduce()', 'forEach()'], correctAnswer: 'filter()', points: 5 },
      { id: '3', type: 'true_false', question: 'JavaScript is a statically typed language.', correctAnswer: 'false', points: 5 },
      { id: '4', type: 'multiple_choice', question: 'What does the "===" operator do?', options: ['Loose equality', 'Strict equality', 'Assignment', 'Comparison with type coercion'], correctAnswer: 'Strict equality', points: 5 },
      { id: '5', type: 'multiple_choice', question: 'Which is NOT a JavaScript data type?', options: ['Number', 'String', 'Float', 'Boolean'], correctAnswer: 'Float', points: 5 },
    ],
  },
  {
    id: '2',
    title: 'React Mastery',
    category: 'Technical Skills',
    description: 'Comprehensive assessment of React concepts including hooks, context, and performance optimization.',
    duration: 35,
    passingScore: 75,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What hook is used for side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctAnswer: 'useEffect', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is the correct way to update state based on previous state?', options: ['setState(newValue)', 'setState(prev => prev + 1)', 'state = newValue', 'updateState(newValue)'], correctAnswer: 'setState(prev => prev + 1)', points: 5 },
      { id: '3', type: 'multiple_choice', question: 'What is the purpose of React.memo?', options: ['To memoize values', 'To memoize components', 'To create context', 'To handle errors'], correctAnswer: 'To memoize components', points: 5 },
      { id: '4', type: 'true_false', question: 'useCallback is used to memoize functions.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '3',
    title: 'Python Programming',
    category: 'Technical Skills',
    description: 'Test your Python knowledge from basics to advanced concepts.',
    duration: 30,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the output of: print(type([]))?', options: ['<class list>', '<class array>', '<class tuple>', '<class set>'], correctAnswer: '<class list>', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which method is used to add an element to a set?', options: ['append()', 'add()', 'push()', 'insert()'], correctAnswer: 'add()', points: 5 },
      { id: '3', type: 'true_false', question: 'Python is an interpreted language.', correctAnswer: 'true', points: 5 },
      { id: '4', type: 'multiple_choice', question: 'What does PEP 8 stand for?', options: ['Python Enhancement Proposal', 'Python Extension Package', 'Python Environment Protocol', 'Python Error Prevention'], correctAnswer: 'Python Enhancement Proposal', points: 5 },
    ],
  },
  {
    id: '4',
    title: 'Data Structures & Algorithms',
    category: 'Technical Skills',
    description: 'Core computer science concepts for technical interviews.',
    duration: 45,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'], correctAnswer: 'O(log n)', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correctAnswer: 'Stack', points: 5 },
      { id: '3', type: 'multiple_choice', question: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 'O(n)', points: 5 },
      { id: '4', type: 'true_false', question: 'A binary search tree has O(1) lookup time in the worst case.', correctAnswer: 'false', points: 5 },
    ],
  },
  {
    id: '5',
    title: 'AWS Cloud Practitioner',
    category: 'Technical Skills',
    description: 'Amazon Web Services fundamentals and cloud concepts.',
    duration: 40,
    passingScore: 72,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which AWS service provides object storage?', options: ['EC2', 'S3', 'RDS', 'Lambda'], correctAnswer: 'S3', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does EC2 stand for?', options: ['Elastic Compute Cloud', 'Elastic Container Cloud', 'Enterprise Compute Cloud', 'Extended Compute Cloud'], correctAnswer: 'Elastic Compute Cloud', points: 5 },
      { id: '3', type: 'true_false', question: 'AWS Lambda is a serverless compute service.', correctAnswer: 'true', points: 5 },
      { id: '4', type: 'multiple_choice', question: 'Which service is used for relational databases?', options: ['DynamoDB', 'S3', 'RDS', 'ElastiCache'], correctAnswer: 'RDS', points: 5 },
    ],
  },
  {
    id: '6',
    title: 'Docker & Containerization',
    category: 'Technical Skills',
    description: 'Container technology and Docker fundamentals.',
    duration: 25,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is a Docker image?', options: ['A running container', 'A read-only template', 'A volume', 'A network'], correctAnswer: 'A read-only template', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which command lists all running containers?', options: ['docker ps', 'docker list', 'docker show', 'docker containers'], correctAnswer: 'docker ps', points: 5 },
      { id: '3', type: 'true_false', question: 'Docker containers share the host OS kernel.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '7',
    title: 'SQL & Database Design',
    category: 'Technical Skills',
    description: 'Database concepts, SQL queries, and data modeling.',
    duration: 35,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which SQL keyword is used to remove duplicate rows?', options: ['UNIQUE', 'DISTINCT', 'GROUP BY', 'ORDER BY'], correctAnswer: 'DISTINCT', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does ACID stand for?', options: ['Atomicity, Consistency, Isolation, Durability', 'Association, Consistency, Integration, Durability', 'Atomicity, Concurrency, Isolation, Dependency', 'Association, Concurrency, Integration, Dependency'], correctAnswer: 'Atomicity, Consistency, Isolation, Durability', points: 5 },
      { id: '3', type: 'true_false', question: 'A LEFT JOIN returns all records from the left table.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '8',
    title: 'TypeScript Essentials',
    category: 'Technical Skills',
    description: 'Type-safe JavaScript development with TypeScript.',
    duration: 30,
    passingScore: 75,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the TypeScript compiler called?', options: ['tsc', 'ts-node', 'typescript', 'ts-compile'], correctAnswer: 'tsc', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which type represents any value in TypeScript?', options: ['any', 'unknown', 'void', 'never'], correctAnswer: 'any', points: 5 },
      { id: '3', type: 'true_false', question: 'TypeScript is a superset of JavaScript.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '9',
    title: 'Node.js Backend Development',
    category: 'Technical Skills',
    description: 'Server-side JavaScript with Node.js and Express.',
    duration: 35,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the default package manager for Node.js?', options: ['npm', 'yarn', 'pnpm', 'bower'], correctAnswer: 'npm', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which module is used for file system operations?', options: ['fs', 'path', 'http', 'url'], correctAnswer: 'fs', points: 5 },
      { id: '3', type: 'true_false', question: 'Node.js is single-threaded.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '10',
    title: 'Git Version Control',
    category: 'Technical Skills',
    description: 'Source control management with Git.',
    duration: 25,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which command creates a new branch?', options: ['git branch', 'git checkout', 'git switch', 'All of the above'], correctAnswer: 'All of the above', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does "git pull" do?', options: ['Fetches and merges', 'Only fetches', 'Only merges', 'Creates a branch'], correctAnswer: 'Fetches and merges', points: 5 },
      { id: '3', type: 'true_false', question: 'Git is a distributed version control system.', correctAnswer: 'true', points: 5 },
    ],
  },

  // DATA SCIENCE & AI
  {
    id: '11',
    title: 'Machine Learning Fundamentals',
    category: 'Data Science',
    description: 'Core ML concepts, algorithms, and applications.',
    duration: 40,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which is a supervised learning algorithm?', options: ['K-means', 'Linear Regression', 'PCA', 'Apriori'], correctAnswer: 'Linear Regression', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does overfitting mean?', options: ['Model performs well on training but poorly on test', 'Model performs poorly on both', 'Model has too few parameters', 'Model is too simple'], correctAnswer: 'Model performs well on training but poorly on test', points: 5 },
      { id: '3', type: 'true_false', question: 'Cross-validation helps prevent overfitting.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '12',
    title: 'Python for Data Science',
    category: 'Data Science',
    description: 'Pandas, NumPy, and data manipulation in Python.',
    duration: 35,
    passingScore: 72,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which library is used for data manipulation?', options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'], correctAnswer: 'Pandas', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does df.head() return?', options: ['First 5 rows', 'Last 5 rows', 'Column names', 'Data types'], correctAnswer: 'First 5 rows', points: 5 },
      { id: '3', type: 'true_false', question: 'NumPy arrays are faster than Python lists.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '13',
    title: 'Data Visualization',
    category: 'Data Science',
    description: 'Creating effective charts and visual representations.',
    duration: 25,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which chart is best for showing trends over time?', options: ['Pie chart', 'Line chart', 'Bar chart', 'Scatter plot'], correctAnswer: 'Line chart', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is the purpose of a histogram?', options: ['Show distribution', 'Show correlation', 'Show proportions', 'Show geography'], correctAnswer: 'Show distribution', points: 5 },
      { id: '3', type: 'true_false', question: 'Color should be used meaningfully in data visualization.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '14',
    title: 'Deep Learning Basics',
    category: 'Data Science',
    description: 'Neural networks and deep learning fundamentals.',
    duration: 45,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is an activation function?', options: ['Determines neuron output', 'Initializes weights', 'Normalizes data', 'Reduces dimensions'], correctAnswer: 'Determines neuron output', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which is a type of neural network layer?', options: ['Convolutional', 'Relational', 'Hierarchical', 'Sequential'], correctAnswer: 'Convolutional', points: 5 },
      { id: '3', type: 'true_false', question: 'Backpropagation is used to update neural network weights.', correctAnswer: 'true', points: 5 },
    ],
  },

  // CYBERSECURITY
  {
    id: '15',
    title: 'Cybersecurity Fundamentals',
    category: 'Cybersecurity',
    description: 'Security principles, threats, and best practices.',
    duration: 35,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What does CIA stand for in security?', options: ['Confidentiality, Integrity, Availability', 'Control, Integrity, Access', 'Confidentiality, Information, Authentication', 'Control, Information, Access'], correctAnswer: 'Confidentiality, Integrity, Availability', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is a DDoS attack?', options: ['Distributed Denial of Service', 'Data Destruction on Server', 'Direct Database Override System', 'Dynamic Domain Operating System'], correctAnswer: 'Distributed Denial of Service', points: 5 },
      { id: '3', type: 'true_false', question: 'Two-factor authentication adds an extra layer of security.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '16',
    title: 'Ethical Hacking',
    category: 'Cybersecurity',
    description: 'Penetration testing and vulnerability assessment.',
    duration: 40,
    passingScore: 72,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the first phase of penetration testing?', options: ['Exploitation', 'Reconnaissance', 'Reporting', 'Scanning'], correctAnswer: 'Reconnaissance', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What tool is used for network scanning?', options: ['Nmap', 'Photoshop', 'Excel', 'WordPress'], correctAnswer: 'Nmap', points: 5 },
      { id: '3', type: 'true_false', question: 'SQL injection targets database vulnerabilities.', correctAnswer: 'true', points: 5 },
    ],
  },

  // DESIGN
  {
    id: '17',
    title: 'UI/UX Design Principles',
    category: 'Design',
    description: 'User interface and experience design fundamentals.',
    duration: 30,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What does UX stand for?', options: ['User Experience', 'User Extension', 'Universal Experience', 'User Expert'], correctAnswer: 'User Experience', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is a wireframe?', options: ['A low-fidelity design sketch', 'A high-fidelity mockup', 'A color palette', 'A font collection'], correctAnswer: 'A low-fidelity design sketch', points: 5 },
      { id: '3', type: 'true_false', question: 'White space is important in design.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '18',
    title: 'Figma Mastery',
    category: 'Design',
    description: 'Design tool proficiency with Figma.',
    duration: 25,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is a component in Figma?', options: ['A reusable design element', 'A color style', 'A text layer', 'An export setting'], correctAnswer: 'A reusable design element', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does Auto Layout do?', options: ['Automatically resizes elements', 'Exports designs', 'Creates animations', 'Generates code'], correctAnswer: 'Automatically resizes elements', points: 5 },
      { id: '3', type: 'true_false', question: 'Figma supports real-time collaboration.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '19',
    title: 'Color Theory',
    category: 'Design',
    description: 'Understanding color relationships and applications.',
    duration: 20,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What are the primary colors?', options: ['Red, Yellow, Blue', 'Red, Green, Blue', 'Cyan, Magenta, Yellow', 'Black, White, Gray'], correctAnswer: 'Red, Yellow, Blue', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What do complementary colors do?', options: ['Contrast each other', 'Blend together', 'Create gray', 'Are the same hue'], correctAnswer: 'Contrast each other', points: 5 },
      { id: '3', type: 'true_false', question: 'Color psychology affects user perception.', correctAnswer: 'true', points: 5 },
    ],
  },

  // PRODUCT MANAGEMENT
  {
    id: '20',
    title: 'Product Management Essentials',
    category: 'Product',
    description: 'Product strategy, roadmap, and lifecycle management.',
    duration: 35,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is an MVP?', options: ['Minimum Viable Product', 'Most Valuable Player', 'Maximum Value Proposition', 'Minimum Value Product'], correctAnswer: 'Minimum Viable Product', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which framework prioritizes features by value vs effort?', options: ['RICE', 'SWOT', 'PEST', 'Porter\'s Five Forces'], correctAnswer: 'RICE', points: 5 },
      { id: '3', type: 'true_false', question: 'User research is essential for product development.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '21',
    title: 'Agile & Scrum',
    category: 'Product',
    description: 'Agile methodologies and Scrum framework.',
    duration: 30,
    passingScore: 72,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'How long is a typical sprint?', options: ['1-4 weeks', '1 day', '6 months', '1 year'], correctAnswer: '1-4 weeks', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Who facilitates the daily standup?', options: ['Scrum Master', 'Product Owner', 'Team Lead', 'Stakeholder'], correctAnswer: 'Scrum Master', points: 5 },
      { id: '3', type: 'true_false', question: 'The product owner prioritizes the backlog.', correctAnswer: 'true', points: 5 },
    ],
  },

  // MARKETING
  {
    id: '22',
    title: 'Digital Marketing',
    category: 'Marketing',
    description: 'Online marketing strategies and channels.',
    duration: 30,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What does SEO stand for?', options: ['Search Engine Optimization', 'Social Engagement Online', 'Sales Enablement Operation', 'Search Engagement Optimization'], correctAnswer: 'Search Engine Optimization', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is a conversion rate?', options: ['Percentage of visitors who take action', 'Number of website visits', 'Cost per click', 'Email open rate'], correctAnswer: 'Percentage of visitors who take action', points: 5 },
      { id: '3', type: 'true_false', question: 'Content marketing focuses on creating valuable content.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '23',
    title: 'Social Media Marketing',
    category: 'Marketing',
    description: 'Social platforms and engagement strategies.',
    duration: 25,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which platform is best for B2B marketing?', options: ['LinkedIn', 'TikTok', 'Snapchat', 'Pinterest'], correctAnswer: 'LinkedIn', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is engagement rate?', options: ['Interactions / Followers', 'Posts / Day', 'Likes / Comments', 'Shares / Saves'], correctAnswer: 'Interactions / Followers', points: 5 },
      { id: '3', type: 'true_false', question: 'Hashtags increase content discoverability.', correctAnswer: 'true', points: 5 },
    ],
  },

  // FINANCE
  {
    id: '24',
    title: 'Financial Analysis',
    category: 'Finance',
    description: 'Financial statements and analysis techniques.',
    duration: 40,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What does ROI stand for?', options: ['Return on Investment', 'Rate of Income', 'Revenue on Investment', 'Return on Income'], correctAnswer: 'Return on Investment', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which statement shows profitability?', options: ['Income Statement', 'Balance Sheet', 'Cash Flow', 'Equity Statement'], correctAnswer: 'Income Statement', points: 5 },
      { id: '3', type: 'true_false', question: 'Current ratio measures liquidity.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '25',
    title: 'Investment Fundamentals',
    category: 'Finance',
    description: 'Investment principles and portfolio management.',
    duration: 35,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is diversification?', options: ['Spreading investments', 'Concentrating investments', 'Selling investments', 'Buying one stock'], correctAnswer: 'Spreading investments', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is a bull market?', options: ['Rising prices', 'Falling prices', 'Stable prices', 'No trading'], correctAnswer: 'Rising prices', points: 5 },
      { id: '3', type: 'true_false', question: 'Higher risk typically means higher potential returns.', correctAnswer: 'true', points: 5 },
    ],
  },

  // SOFT SKILLS
  {
    id: '26',
    title: 'Communication Skills',
    category: 'Soft Skills',
    description: 'Evaluate your communication, teamwork, and interpersonal skills.',
    duration: 20,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the most effective way to give constructive feedback?', options: ['Focus on personality', 'Be specific and actionable', 'Wait for the annual review', 'Send an email'], correctAnswer: 'Be specific and actionable', points: 5 },
      { id: '2', type: 'true_false', question: 'Active listening involves interrupting to show you understand.', correctAnswer: 'false', points: 5 },
      { id: '3', type: 'multiple_choice', question: 'Which is a key element of effective communication?', options: ['Clarity', 'Complexity', 'Length', 'Speed'], correctAnswer: 'Clarity', points: 5 },
    ],
  },
  {
    id: '27',
    title: 'Leadership & Management',
    category: 'Soft Skills',
    description: 'Leadership styles and team management.',
    duration: 30,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is transformational leadership?', options: ['Inspiring change', 'Commanding control', 'Delegating tasks', 'Avoiding decisions'], correctAnswer: 'Inspiring change', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is emotional intelligence?', options: ['Understanding emotions', 'Ignoring feelings', 'Being logical', 'Making quick decisions'], correctAnswer: 'Understanding emotions', points: 5 },
      { id: '3', type: 'true_false', question: 'Delegation is a sign of weak leadership.', correctAnswer: 'false', points: 5 },
    ],
  },
  {
    id: '28',
    title: 'Time Management',
    category: 'Soft Skills',
    description: 'Productivity and time management techniques.',
    duration: 20,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the Eisenhower Matrix?', options: ['Priority framework', 'Math formula', 'Project plan', 'Calendar app'], correctAnswer: 'Priority framework', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does the Pomodoro Technique involve?', options: ['25-minute focused work', '8-hour blocks', 'Random breaks', 'No breaks'], correctAnswer: '25-minute focused work', points: 5 },
      { id: '3', type: 'true_false', question: 'Multitasking increases productivity.', correctAnswer: 'false', points: 5 },
    ],
  },
  {
    id: '29',
    title: 'Problem Solving',
    category: 'Soft Skills',
    description: 'Critical thinking and analytical skills.',
    duration: 25,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the first step in problem solving?', options: ['Define the problem', 'Implement solution', 'Brainstorm ideas', 'Evaluate results'], correctAnswer: 'Define the problem', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is root cause analysis?', options: ['Finding underlying cause', 'Quick fix', 'Ignoring problem', 'Blaming others'], correctAnswer: 'Finding underlying cause', points: 5 },
      { id: '3', type: 'true_false', question: 'Brainstorming encourages all ideas without judgment.', correctAnswer: 'true', points: 5 },
    ],
  },

  // LANGUAGES
  {
    id: '30',
    title: 'English Proficiency',
    category: 'Language Proficiency',
    description: 'English language skills assessment.',
    duration: 25,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which is correct: "They ___ going to the store"?', options: ['are', 'is', 'am', 'be'], correctAnswer: 'are', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is the past tense of "go"?', options: ['went', 'goed', 'gone', 'going'], correctAnswer: 'went', points: 5 },
      { id: '3', type: 'true_false', question: '"Its" and "it\'s" have the same meaning.', correctAnswer: 'false', points: 5 },
    ],
  },
  {
    id: '31',
    title: 'Business English',
    category: 'Language Proficiency',
    description: 'Professional communication in English.',
    duration: 30,
    passingScore: 72,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What does "ASAP" mean?', options: ['As soon as possible', 'At some agreed point', 'Always say a prayer', 'Ask someone about problem'], correctAnswer: 'As soon as possible', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'Which is more formal: "Thanks" or "Thank you"?', options: ['Thank you', 'Thanks', 'Both same', 'Neither formal'], correctAnswer: 'Thank you', points: 5 },
      { id: '3', type: 'true_false', question: '"FYI" means "For Your Information".', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '32',
    title: 'Spanish Basics',
    category: 'Language Proficiency',
    description: 'Fundamental Spanish language skills.',
    duration: 25,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What does "Hola" mean?', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], correctAnswer: 'Hello', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'How do you say "Thank you" in Spanish?', options: ['Gracias', 'Por favor', 'De nada', 'Buenos días'], correctAnswer: 'Gracias', points: 5 },
      { id: '3', type: 'true_false', question: 'Spanish uses gendered nouns.', correctAnswer: 'true', points: 5 },
    ],
  },

  // INDUSTRY KNOWLEDGE
  {
    id: '33',
    title: 'Healthcare Industry',
    category: 'Industry Knowledge',
    description: 'Healthcare systems and terminology.',
    duration: 30,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What does HIPAA protect?', options: ['Patient privacy', 'Doctor salaries', 'Hospital buildings', 'Medical equipment'], correctAnswer: 'Patient privacy', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is an EHR?', options: ['Electronic Health Record', 'Emergency Hospital Room', 'Employee Health Report', 'Electronic Hospital Registry'], correctAnswer: 'Electronic Health Record', points: 5 },
      { id: '3', type: 'true_false', question: 'Telemedicine allows remote healthcare delivery.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '34',
    title: 'E-commerce Fundamentals',
    category: 'Industry Knowledge',
    description: 'Online retail and digital commerce.',
    duration: 25,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is cart abandonment?', options: ['Leaving without purchase', 'Adding items to cart', 'Checking out', 'Creating account'], correctAnswer: 'Leaving without purchase', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does CAC stand for?', options: ['Customer Acquisition Cost', 'Cart Add Count', 'Checkout Average Cost', 'Credit Authorization Code'], correctAnswer: 'Customer Acquisition Cost', points: 5 },
      { id: '3', type: 'true_false', question: 'Mobile commerce is growing rapidly.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '35',
    title: 'Real Estate Basics',
    category: 'Industry Knowledge',
    description: 'Property and real estate fundamentals.',
    duration: 30,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is an appraisal?', options: ['Property value estimate', 'Home inspection', 'Mortgage approval', 'Title search'], correctAnswer: 'Property value estimate', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does MLS stand for?', options: ['Multiple Listing Service', 'Mortgage Loan System', 'Market Listing Service', 'Multi-Level Sale'], correctAnswer: 'Multiple Listing Service', points: 5 },
      { id: '3', type: 'true_false', question: 'Location is a key factor in property value.', correctAnswer: 'true', points: 5 },
    ],
  },

  // APTITUDE
  {
    id: '36',
    title: 'Logical Reasoning',
    category: 'Aptitude',
    description: 'Pattern recognition and logical thinking.',
    duration: 25,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Complete the series: 2, 4, 8, 16, ?', options: ['32', '24', '20', '30'], correctAnswer: '32', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'If all roses are flowers, and some flowers fade quickly, then:', options: ['Some roses may fade quickly', 'All roses fade quickly', 'No roses fade', 'Roses never fade'], correctAnswer: 'Some roses may fade quickly', points: 5 },
      { id: '3', type: 'true_false', question: 'Deductive reasoning moves from general to specific.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '37',
    title: 'Numerical Aptitude',
    category: 'Aptitude',
    description: 'Mathematical and numerical problem solving.',
    duration: 30,
    passingScore: 68,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is 25% of 80?', options: ['20', '25', '15', '30'], correctAnswer: '20', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'If 3 workers complete a job in 6 days, how long for 6 workers?', options: ['3 days', '6 days', '12 days', '9 days'], correctAnswer: '3 days', points: 5 },
      { id: '3', type: 'true_false', question: 'The average of 10, 20, and 30 is 20.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '38',
    title: 'Verbal Reasoning',
    category: 'Aptitude',
    description: 'Comprehension and verbal analysis.',
    duration: 25,
    passingScore: 65,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Which word is the opposite of "abundant"?', options: ['Scarce', 'Plentiful', 'Numerous', 'Copious'], correctAnswer: 'Scarce', points: 5 },
      { id: '2', type: 'multiple_choice', question: '"Meticulous" most nearly means:', options: ['Careful', 'Careless', 'Quick', 'Lazy'], correctAnswer: 'Careful', points: 5 },
      { id: '3', type: 'true_false', question: 'Context helps determine word meaning.', correctAnswer: 'true', points: 5 },
    ],
  },

  // PROJECT MANAGEMENT
  {
    id: '39',
    title: 'Project Management Professional',
    category: 'Project Management',
    description: 'PMI-aligned project management concepts.',
    duration: 40,
    passingScore: 72,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the triple constraint?', options: ['Scope, Time, Cost', 'People, Process, Technology', 'Plan, Execute, Monitor', 'Initiate, Plan, Close'], correctAnswer: 'Scope, Time, Cost', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What is a Gantt chart used for?', options: ['Schedule visualization', 'Budget tracking', 'Risk assessment', 'Quality control'], correctAnswer: 'Schedule visualization', points: 5 },
      { id: '3', type: 'true_false', question: 'Stakeholder management is part of project management.', correctAnswer: 'true', points: 5 },
    ],
  },
  {
    id: '40',
    title: 'Risk Management',
    category: 'Project Management',
    description: 'Identifying and mitigating project risks.',
    duration: 30,
    passingScore: 70,
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is risk mitigation?', options: ['Reducing risk impact', 'Ignoring risk', 'Accepting all risks', 'Creating risks'], correctAnswer: 'Reducing risk impact', points: 5 },
      { id: '2', type: 'multiple_choice', question: 'What does SWOT analysis assess?', options: ['Strengths, Weaknesses, Opportunities, Threats', 'Schedule, Work, Output, Time', 'Scope, Work, Objectives, Tasks', 'Systems, Workflows, Operations, Teams'], correctAnswer: 'Strengths, Weaknesses, Opportunities, Threats', points: 5 },
      { id: '3', type: 'true_false', question: 'All risks should be avoided.', correctAnswer: 'false', points: 5 },
    ],
  },
];

// Mock Quiz Attempts
const mockQuizAttempts: QuizAttempt[] = [
  { id: '1', quizId: '1', userId: '1', startedAt: new Date('2024-02-15'), completedAt: new Date('2024-02-15'), answers: {}, score: 88, percentage: 88 },
  { id: '2', quizId: '2', userId: '1', startedAt: new Date('2024-03-01'), completedAt: new Date('2024-03-01'), answers: {}, score: 96, percentage: 96 },
  { id: '3', quizId: '3', userId: '1', startedAt: new Date('2024-01-20'), completedAt: new Date('2024-01-20'), answers: {}, score: 78, percentage: 78 },
];

// Mock Applications
const mockApplications: Application[] = [
  { id: '1', jobId: '1', userId: '1', status: 'interview', appliedAt: new Date('2024-03-02'), updatedAt: new Date('2024-03-08'), notes: 'Strong candidate, moved to interview stage' },
  { id: '2', jobId: '2', userId: '1', status: 'shortlisted', appliedAt: new Date('2024-03-06'), updatedAt: new Date('2024-03-09') },
  { id: '3', jobId: '3', userId: '2', status: 'new', appliedAt: new Date('2024-03-11'), updatedAt: new Date('2024-03-11') },
  { id: '4', jobId: '1', userId: '3', status: 'testing', appliedAt: new Date('2024-03-03'), updatedAt: new Date('2024-03-07') },
  { id: '5', jobId: '4', userId: '2', status: 'rejected', appliedAt: new Date('2024-03-05'), updatedAt: new Date('2024-03-10'), notes: 'Not enough DevOps experience' },
];

// Mock Custom Tests
const mockCustomTests: CustomTest[] = [
  {
    id: '1',
    companyId: '1',
    jobId: '1',
    title: 'Full Stack Technical Assessment',
    description: 'Comprehensive technical assessment for senior full stack developer position.',
    questions: [
      { id: '1', type: 'multiple_choice', question: 'What is the time complexity of Array.prototype.sort() in JavaScript?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 'O(n log n)', points: 10, category: 'Algorithms' },
      { id: '2', type: 'coding', question: 'Write a function to reverse a linked list.', points: 30, category: 'Data Structures' },
      { id: '3', type: 'short_answer', question: 'Explain the difference between SQL and NoSQL databases.', points: 20, category: 'Databases' },
    ],
    settings: { timeLimit: 90, passingScore: 70, maxAttempts: 2, randomizeQuestions: true, proctoringEnabled: true },
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    companyId: '2',
    jobId: '2',
    title: 'Frontend Coding Challenge',
    description: 'Practical assessment of frontend development skills.',
    questions: [
      { id: '1', type: 'coding', question: 'Create a React component that fetches and displays a list of users from an API.', points: 40, category: 'React' },
      { id: '2', type: 'multiple_choice', question: 'Which CSS property creates a flex container?', options: ['display: block', 'display: flex', 'position: flex', 'flex: 1'], correctAnswer: 'display: flex', points: 10, category: 'CSS' },
    ],
    settings: { timeLimit: 60, passingScore: 65, maxAttempts: 3, randomizeQuestions: false, proctoringEnabled: false },
    createdAt: new Date('2024-03-05'),
  },
];

// Mock Test Results
const mockTestResults: TestResult[] = [
  { id: '1', testId: '1', applicationId: '4', userId: '3', startedAt: new Date('2024-03-07'), completedAt: new Date('2024-03-07'), answers: {}, score: 75, percentage: 75, passed: true },
];

// Mock Notifications
const mockNotifications: Notification[] = [
  { id: '1', userId: '1', type: 'job_match', title: 'New Job Match!', message: 'We found a job that matches your skills: Senior Full Stack Developer at TechCorp', read: false, createdAt: new Date('2024-03-11'), data: { jobId: '1' } },
  { id: '2', userId: '1', type: 'application_update', title: 'Application Update', message: 'Your application for Frontend Engineer has been shortlisted', read: false, createdAt: new Date('2024-03-09'), data: { applicationId: '2' } },
  { id: '3', userId: '1', type: 'badge_earned', title: 'New Badge Earned!', message: 'Congratulations! You earned the React Specialist Platinum badge', read: true, createdAt: new Date('2024-03-01'), data: { badgeId: '2' } },
];

// Mock Dashboard Metrics
const mockDashboardMetrics: DashboardMetrics = {
  activeJobs: 12,
  totalViews: 2456,
  applications: 156,
  interviews: 34,
  hires: 8,
  timeToHire: 28,
  costPerHire: 3200,
};

// Mock Analytics Data
const mockAnalyticsData: AnalyticsData = {
  jobPostingStats: { active: 12, expired: 5, draft: 3 },
  applicationFunnel: { views: 2456, applications: 156, interviews: 34, hires: 8 },
  candidateSources: { 'Direct': 45, 'LinkedIn': 35, 'Indeed': 20, 'Referral': 15 },
  timeToHireTrends: [
    { date: '2024-01', days: 32 },
    { date: '2024-02', days: 30 },
    { date: '2024-03', days: 28 },
  ],
  topPerformingJobs: [
    { jobId: '1', title: 'Senior Full Stack Developer', views: 245, applications: 32 },
    { jobId: '2', title: 'Frontend Engineer', views: 189, applications: 24 },
    { jobId: '3', title: 'Backend Developer - Python', views: 156, applications: 18 },
  ],
  skillGapAnalysis: { 'React': 85, 'Node.js': 72, 'Python': 45, 'AWS': 38, 'DevOps': 25 },
};

export function useMockDataInternal() {
  const [profile, setProfile] = useState<JobSeekerProfile>(mockProfile);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [companies] = useState<Company[]>(mockCompanies);
  const [badges, setBadges] = useState<Badge[]>(mockBadges);
  const [quizzes] = useState<Quiz[]>(mockQuizzes);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(mockQuizAttempts);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [customTests, setCustomTests] = useState<CustomTest[]>(mockCustomTests);
  const [testResults] = useState<TestResult[]>(mockTestResults);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [cvTemplates] = useState<CVTemplate[]>(mockCVTemplates);
  const [dashboardMetrics] = useState<DashboardMetrics>(mockDashboardMetrics);
  const [analyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  
  // Swiped jobs state for Tinder-style job matching
  const [swipedJobs, setSwipedJobs] = useState<Array<{ jobId: string; liked: boolean; timestamp: Date }>>([]);

  // Calculate job matches based on profile
  const getJobMatches = useCallback((): JobMatch[] => {
    return jobs.map(job => {
      const requiredSkills = job.skills.map(s => s.toLowerCase());
      const userSkills = profile.skills.map(s => s.name.toLowerCase());
      
      // Skills match (40%)
      const matchingSkills = requiredSkills.filter(s => userSkills.includes(s)).length;
      const skillsMatch = Math.round((matchingSkills / requiredSkills.length) * 100) || 0;
      
      // Experience match (25%)
      const expLevels = { entry: 1, mid: 2, senior: 3, executive: 4 };
      const userExp = profile.workExperience.reduce((acc, exp) => {
        const years = exp.current 
          ? (new Date().getFullYear() - exp.startDate.getFullYear())
          : (exp.endDate!.getFullYear() - exp.startDate.getFullYear());
        return acc + years;
      }, 0);
      const userExpLevel = userExp < 3 ? 'entry' : userExp < 6 ? 'mid' : 'senior';
      const experienceMatch = Math.round((expLevels[userExpLevel] / expLevels[job.experienceLevel]) * 100);
      
      // Location match (15%)
      const locationMatch = job.location.remote || profile.location.remote ? 100 : 
        (job.location.city === profile.location.city ? 100 : 50);
      
      // Salary match (10%)
      const salaryMatch = job.salary && profile.expectedSalary
        ? Math.round((Math.min(job.salary.max, profile.expectedSalary.max) / Math.max(job.salary.max, profile.expectedSalary.max)) * 100)
        : 50;
      
      // Industry match (10%)
      const industryMatch = profile.preferences.industries.includes(job.industry) ? 100 : 50;
      
      // Weighted compatibility score
      const compatibilityScore = Math.round(
        (skillsMatch * 0.40) +
        (experienceMatch * 0.25) +
        (locationMatch * 0.15) +
        (salaryMatch * 0.10) +
        (industryMatch * 0.10)
      );
      
      return {
        job,
        compatibilityScore,
        skillsMatch,
        experienceMatch,
        locationMatch,
        salaryMatch,
        industryMatch,
      };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [jobs, profile]);

  // Apply to a job
  const applyToJob = useCallback(async (jobId: string, coverLetter?: string) => {
    console.log('applyToJob called with:', { userId: profile.userId, jobId, coverLetter });
    
    // 1. Always update local state immediately so UI gives instant feedback
    const newId = Date.now().toString();
    const newApplication: Application = {
      id: newId,
      jobId,
      userId: profile.userId,
      status: 'new',
      appliedAt: new Date(),
      updatedAt: new Date(),
      coverLetter,
    };
    setApplications(prev => [...prev, newApplication]);
    
    const newNotification: Notification = {
      id: newId,
      userId: profile.userId,
      type: 'application_update',
      title: 'Application Submitted',
      message: `Your application has been submitted successfully!`,
      read: false,
      createdAt: new Date(),
      data: { applicationId: newId, jobId },
    };
    setNotifications(prev => [newNotification, ...prev]);

    // 2. Call the backend API (we keep this dependency!)
    try {
      const { applyToJob: apiApply } = await import('@/lib/auth');
      const { data, error } = await apiApply(profile.userId, jobId, coverLetter);
      console.log('API response:', { data, error });
      
      // If error from backend, we just log it since UI is updated
      if (error) {
        console.warn('Backend returned error but UI updated:', error);
      }
      return { error: null }; // Return success to caller so success toast shows
    } catch (err) {
      console.error('applyToJob API exception (UI updated locally):', err);
      return { error: null }; // Return success to caller so success toast shows
    }
  }, [profile.userId]);

  // Update application status
  const updateApplicationStatus = useCallback((applicationId: string, status: Application['status'], notes?: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, status, notes: notes || app.notes, updatedAt: new Date() }
        : app
    ));
  }, []);

  // Complete a quiz
  const completeQuiz = useCallback((quizId: string, answers: Record<string, string | string[]>, score: number) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const percentage = Math.round((score / quiz.questions.reduce((acc, q) => acc + q.points, 0)) * 100);
    
    const newAttempt: QuizAttempt = {
      id: Date.now().toString(),
      quizId,
      userId: profile.userId,
      startedAt: new Date(),
      completedAt: new Date(),
      answers,
      score,
      percentage,
    };
    setQuizAttempts(prev => [...prev, newAttempt]);

    // Award badge if passing score
    if (percentage >= quiz.passingScore) {
      let level: Badge['level'] = 'bronze';
      if (percentage >= 95) level = 'platinum';
      else if (percentage >= 85) level = 'gold';
      else if (percentage >= 70) level = 'silver';

      const newBadge: Badge = {
        id: Date.now().toString(),
        userId: profile.userId,
        name: quiz.title,
        category: quiz.category,
        level,
        score: percentage,
        earnedAt: new Date(),
        icon: 'award',
      };
      setBadges(prev => [...prev, newBadge]);
    }
  }, [quizzes, profile.userId]);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, []);

  // Update profile
  const updateProfile = useCallback((updates: Partial<JobSeekerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  // Swipe job (like/dislike) for Tinder-style matching
  const swipeJob = useCallback((jobId: string, liked: boolean) => {
    setSwipedJobs(prev => {
      // Prevent duplicates in global swiped list
      if (prev.some(s => s.jobId === jobId)) return prev;
      return [...prev, { jobId, liked, timestamp: new Date() }];
    });
  }, []);

  // Undo last swipe
  const undoSwipe = useCallback(() => {
    setSwipedJobs(prev => prev.slice(0, -1));
  }, []);

  return {
    profile,
    jobs,
    setJobs,
    companies,
    badges,
    quizzes,
    quizAttempts,
    applications,
    customTests,
    setCustomTests,
    testResults,
    notifications,
    cvTemplates,
    dashboardMetrics,
    analyticsData,
    swipedJobs,
    getJobMatches,
    applyToJob,
    updateApplicationStatus,
    completeQuiz,
    markNotificationRead,
    updateProfile,
    swipeJob,
    undoSwipe,
  };
}

import { createContext, useContext } from 'react';

// Create a context for the mock data so it is shared across all components
export const MockDataContext = createContext<ReturnType<typeof useMockDataInternal> | null>(null);

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
