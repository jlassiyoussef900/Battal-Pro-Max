// User Types
export type UserRole = 'jobseeker' | 'company' | 'hiring_manager';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

// Profile Types
export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: number;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'industry';
  proficiency: number; // 1-100
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface JobSeekerProfile {
  id: string;
  userId: string;
  headline?: string;
  summary?: string;
  location: {
    city: string;
    region: string;
    country: string;
    remote: boolean;
  };
  phone?: string;
  linkedIn?: string;
  portfolio?: string;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  certifications: Certification[];
  badges: Badge[];
  preferences: {
    jobTypes: ('full-time' | 'part-time' | 'contract' | 'internship')[];
    industries: string[];
    companySizes: ('startup' | 'sme' | 'enterprise')[];
  };
}

// Badge Types
export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  userId: string;
  name: string;
  category: string;
  level: BadgeLevel;
  score: number;
  earnedAt: Date;
  icon: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: Question[];
  duration: number; // in minutes
  passingScore: number;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  answers: Record<string, string | string[]>;
  score: number;
  percentage: number;
  badgeEarned?: Badge;
}

// Job Types
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
export type CompanySize = 'startup' | 'sme' | 'enterprise';

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: {
    city?: string;
    region?: string;
    country: string;
    remote: boolean;
    hybrid: boolean;
  };
  type: JobType;
  experienceLevel: ExperienceLevel;
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  skills: string[];
  industry: string;
  postedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'draft' | 'closed';
  views: number;
  applications: number;
}

export interface JobFilter {
  location?: string;
  remote?: boolean;
  hybrid?: boolean;
  jobType?: JobType[];
  experienceLevel?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  industry?: string[];
  skills?: string[];
  companySize?: CompanySize[];
}

export interface JobMatch {
  job: Job;
  compatibilityScore: number;
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  industryMatch: number;
}

// Application Types
export type ApplicationStatus = 
  | 'new' 
  | 'shortlisted' 
  | 'testing' 
  | 'interview' 
  | 'offer' 
  | 'hired' 
  | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
  job?: Job;
  applicant?: JobSeekerProfile;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  size: CompanySize;
  location: {
    city: string;
    country: string;
  };
  website?: string;
  logo?: string;
  founded?: number;
  benefits: string[];
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: 'admin' | 'recruiter' | 'hiring_manager';
  joinedAt: Date;
}

// Test Types
export interface CustomTest {
  id: string;
  companyId: string;
  jobId?: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  settings: {
    timeLimit: number;
    passingScore: number;
    maxAttempts: number;
    randomizeQuestions: boolean;
    proctoringEnabled: boolean;
  };
  createdAt: Date;
}

export interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'coding' | 'file_upload';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  category?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  applicationId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  answers: Record<string, any>;
  score: number;
  percentage: number;
  passed: boolean;
  gradedBy?: string;
  gradedAt?: Date;
}

// Dashboard Types
export interface DashboardMetrics {
  activeJobs: number;
  totalViews: number;
  applications: number;
  interviews: number;
  hires: number;
  timeToHire: number;
  costPerHire: number;
}

export interface AnalyticsData {
  jobPostingStats: {
    active: number;
    expired: number;
    draft: number;
  };
  applicationFunnel: {
    views: number;
    applications: number;
    interviews: number;
    hires: number;
  };
  candidateSources: Record<string, number>;
  timeToHireTrends: { date: string; days: number }[];
  topPerformingJobs: { jobId: string; title: string; views: number; applications: number }[];
  skillGapAnalysis: Record<string, number>;
}

// CV Types
export interface CVTemplate {
  id: string;
  name: string;
  preview: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal';
}

export interface GeneratedCV {
  id: string;
  userId: string;
  templateId: string;
  content: {
    personalInfo: any;
    summary: string;
    experience: WorkExperience[];
    education: Education[];
    skills: Skill[];
    certifications: Certification[];
    badges: Badge[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'job_match' | 'application_update' | 'test_invite' | 'interview_scheduled' | 'badge_earned';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}
