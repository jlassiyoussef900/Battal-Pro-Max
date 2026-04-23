import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { getJobs, getJobById, getUserApplications, createApplication, updateApplicationStatus, getCompanies } from '@/lib/auth';
import type { Job, Application, Badge, Quiz, QuizAttempt, JobSeekerProfile, JobMatch, Company } from '@/types';

export function useData() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [swipedJobs, setSwipedJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobsPage, setJobsPage] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const JOBS_PER_PAGE = 20;

  // Fetch jobs from backend API with pagination
  const fetchJobs = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);
      const { data, error: jobsError } = await getJobs();
      
      if (jobsError) {
        setError(jobsError.message);
      } else {
        const allJobs = (data || []).map((job: any) => {
          return {
            ...job,
            id: job.id || '',
            title: job.title || 'Untitled Position',
            description: job.description || '',
            companyId: job.companyId || job.company_id || '',
            skills: Array.isArray(job.skills) ? job.skills : [],
            requirements: Array.isArray(job.requirements) ? job.requirements : [],
            responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
            location: {
              city: job.location?.city || job.city || null,
              region: job.location?.region || job.region || null,
              country: job.location?.country || job.country || 'Unknown',
              remote: Boolean(job.location?.remote || job.remote),
              hybrid: Boolean(job.location?.hybrid || job.hybrid),
            },
            type: job.type || job.job_type || 'full-time',
            experienceLevel: job.experienceLevel || job.experience_level || 'mid',
            salary: job.salary || (job.salary_min && job.salary_max ? {
              min: Number(job.salary_min) || 0,
              max: Number(job.salary_max) || 0,
              currency: job.salary_currency || 'USD',
              period: job.salary_period || 'yearly',
            } : undefined),
            industry: job.industry || 'Technology',
            status: job.status || 'active',
            views: Number(job.views) || 0,
            applications: Number(job.applications || job.applications_count) || 0,
            postedAt: job.postedAt || job.posted_at || job.created_at || new Date(),
          };
        }).filter((job: any) => job !== null);
        
        const startIndex = (page - 1) * JOBS_PER_PAGE;
        const endIndex = startIndex + JOBS_PER_PAGE;
        const paginatedJobs = allJobs.slice(startIndex, endIndex);
        
        if (append) {
          setJobs(prev => [...prev, ...paginatedJobs]);
        } else {
          setJobs(paginatedJobs);
        }
        
        setHasMoreJobs(endIndex < allJobs.length);
        setJobsPage(page);
      }
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load more jobs
  const loadMoreJobs = useCallback(async () => {
    if (!hasMoreJobs || isLoading) return;
    await fetchJobs(jobsPage + 1, true);
  }, [jobsPage, hasMoreJobs, isLoading, fetchJobs]);

  // Fetch companies from backend API
  const fetchCompanies = useCallback(async () => {
    try {
      const { data, error: companiesError } = await getCompanies();
      
      if (companiesError) {
        console.error('Failed to fetch companies:', companiesError);
      } else {
        setCompanies(data || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  }, []);

  // Fetch applications from backend API
  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error: appsError } = await getUserApplications(user.id);
      
      if (appsError) {
        console.error('Failed to fetch applications:', appsError);
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  }, [user?.id]);

  // Apply to job via backend API
  const applyToJob = useCallback(async (jobId: string, coverLetter?: string) => {
    if (!user?.id) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { data, error: applyError } = await createApplication(user.id, jobId, coverLetter);
      
      if (applyError) {
        return { error: applyError };
      }

      // Refresh applications after successful application
      await fetchApplications();
      
      // Get job details for notification
      const job = jobs.find(j => j.id === jobId);
      const company = companies.find(c => c.id === job?.companyId);
      
      // Add notification
      const newNotification = {
        id: Date.now().toString(),
        userId: user.id,
        type: 'application_update' as const,
        title: 'Application Submitted',
        message: `You applied to ${job?.title || 'a job'}${company ? ` at ${company.name}` : ''}!`,
        read: false,
        createdAt: new Date(),
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem('notifications');
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem('notifications', JSON.stringify([newNotification, ...existing]));
      } catch (err) {
        console.error('Failed to save notification:', err);
      }
      
      return { data, error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to apply to job') };
    }
  }, [user?.id, fetchApplications, jobs, companies]);

  // Swipe job (like/dislike)
  const swipeJob = useCallback(async (jobId: string, liked: boolean) => {
    const newSwipe = { jobId, liked, timestamp: new Date() };
    setSwipedJobs(prev => [...prev, newSwipe]);
    
    // Also persist to localStorage
    try {
      if (user?.id) {
        const key = `swipedJobs_${user.id}`;
        const stored = localStorage.getItem(key);
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [...existing, newSwipe];
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to save swipe to localStorage:', err);
    }
    
    return { error: null };
  }, []);

  // Undo last swipe
  const undoSwipe = useCallback(() => {
    setSwipedJobs(prev => {
      const updated = prev.slice(0, -1);
      // Update localStorage
      if (user?.id) {
        try {
          localStorage.setItem(`swipedJobs_${user.id}`, JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to update localStorage:', err);
        }
      }
      return updated;
    });
  }, []);

  // Other placeholder functions - implement as needed
  const fetchProfile = useCallback(async () => {
    // Implement profile fetching when API is ready
    if (user) {
      // Set a basic profile for now
      setProfile({
        id: user.id,
        userId: user.id,
        phone: '',
        location: { city: '', region: '', country: '', remote: true },
        skills: [],
        workExperience: [],
        education: [],
        preferences: {
          jobTypes: ['full-time'],
          industries: ['Technology'],
          companySizes: ['startup', 'sme', 'enterprise']
        },
        expectedSalary: { min: 50000, max: 150000, currency: 'USD' },
        bio: '',
        avatar: '',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        certifications: [],
        badges: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as JobSeekerProfile);
    }
  }, [user]);

  const fetchBadges = useCallback(async () => {
    // Implement badges fetching when API is ready
    setBadges([]);
  }, [user]);

  const fetchQuizzes = useCallback(async () => {
    // Implement quizzes fetching when API is ready
    setQuizzes([]);
  }, []);

  const fetchQuizAttempts = useCallback(async () => {
    // Implement quiz attempts fetching when API is ready
    setQuizAttempts([]);
  }, [user]);

  const fetchSwipedJobs = useCallback(async () => {
    if (!user?.id) {
      setSwipedJobs([]);
      return;
    }
    // Load from localStorage
    try {
      const stored = localStorage.getItem(`swipedJobs_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSwipedJobs(parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        })));
      } else {
        setSwipedJobs([]);
      }
    } catch (err) {
      console.error('Failed to load swiped jobs from localStorage:', err);
      setSwipedJobs([]);
    }
  }, [user?.id]);

  const completeQuiz = useCallback(async (quizId: string, answers: Record<string, string | string[]>, score: number, percentage: number) => {
    // Implement quiz completion when API is ready
    return { error: null };
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<JobSeekerProfile>) => {
    // Implement profile update when API is ready
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return { error: null };
  }, [user]);

  const getJobMatches = useCallback((): JobMatch[] => {
    if (!jobs.length) {
      return [];
    }
    
    const matches = jobs.map(job => {
      try {
        const jobSkills = Array.isArray(job.skills) ? job.skills : [];
        const userSkills = profile?.skills ? profile.skills.map(s => String(s.name).toLowerCase()) : [];
        const requiredSkills = jobSkills.map(s => String(s).toLowerCase());
        
        const matchingSkills = requiredSkills.filter(s => userSkills.includes(s)).length;
        const skillsMatch = requiredSkills.length > 0 && userSkills.length > 0
          ? Math.round((matchingSkills / requiredSkills.length) * 100) 
          : 50;
        
        return {
          job,
          compatibilityScore: skillsMatch,
          skillsMatch,
          experienceMatch: 50,
          locationMatch: 50,
          salaryMatch: 50,
          industryMatch: 50,
        };
      } catch (err) {
        return {
          job,
          compatibilityScore: 50,
          skillsMatch: 50,
          experienceMatch: 50,
          locationMatch: 50,
          salaryMatch: 50,
          industryMatch: 50,
        };
      }
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    return matches;
  }, [jobs, profile]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(false);
      fetchSwipedJobs();
      
      // Load notifications from localStorage
      try {
        const key = `notifications_${user.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          })));
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setNotifications([]);
      }
    } else {
      setSwipedJobs([]);
      setNotifications([]);
    }
  }, [isAuthenticated, user, fetchSwipedJobs]);

  return {
    profile,
    jobs,
    companies,
    applications,
    badges,
    quizzes,
    quizAttempts,
    swipedJobs,
    notifications,
    isLoading,
    error,
    hasMoreJobs,
    loadMoreJobs,
    getJobMatches,
    applyToJob,
    swipeJob,
    undoSwipe,
    completeQuiz,
    updateProfile,
    markNotificationAsRead: (notificationId: string) => {
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        // Update localStorage
        if (user?.id) {
          try {
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
          } catch (err) {
            console.error('Failed to update notifications:', err);
          }
        }
        return updated;
      });
    },
    refresh: {
      profile: fetchProfile,
      jobs: fetchJobs,
      companies: fetchCompanies,
      applications: fetchApplications,
      badges: fetchBadges,
      quizzes: fetchQuizzes,
      quizAttempts: fetchQuizAttempts,
      swipedJobs: fetchSwipedJobs,
    },
  };
}