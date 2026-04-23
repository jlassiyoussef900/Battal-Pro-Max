const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000';

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export const signUp = async (
  email: string,
  password: string,
  userData: { first_name: string; last_name: string; role: string }
): Promise<ApiResponse<{ user: { id: string; email: string } }>> => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
      }),
    });
    const data = await response.json();
    return {
      data: data.id ? { user: { id: data.id, email } } : null,
      error: response.ok ? null : new Error(data.message || 'Registration failed'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok && data.user) {
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return { data: data.user, error: null };
    }

    return {
      data: null,
      error: new Error(data.message || 'Login failed'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const signOut = async (): Promise<ApiResponse<null>> => {
  localStorage.removeItem('auth_user');
  return { data: null, error: null };
};

export const getCurrentUser = async (): Promise<any> => {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};

export const getSession = async (): Promise<any> => {
  const user = localStorage.getItem('auth_user');
  return user ? { user: JSON.parse(user) } : null;
};

export const getProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/profiles/${userId}`);
    const data = await response.json();
    return {
      data: data.profile || null,
      error: response.ok ? null : new Error(data.message || 'Failed to load profile'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const updateProfile = async (userId: string, updates: any) => {
  try {
    const response = await fetch(`${API_BASE}/profiles/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return {
      data: data.profile || null,
      error: response.ok ? null : new Error(data.message || 'Failed to update profile'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getJobs = async (filters?: any) => {
  try {
    const response = await fetch(`${API_BASE}/jobs`);
    const data = await response.json();
    return {
      data: data.jobs || [],
      error: response.ok ? null : new Error(data.message || 'Failed to load jobs'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getJobById = async (jobId: string) => {
  try {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`);
    const data = await response.json();
    return {
      data: data.job || null,
      error: response.ok ? null : new Error(data.message || 'Failed to load job'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const swipeJob = async (userId: string, jobId: string, action: 'like' | 'pass' | 'maybe') => {
  try {
    const response = await fetch(`${API_BASE}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobSeekerId: userId, jobId, action }),
    });
    const data = await response.json();
    return {
      data: data.id ? { id: data.id } : null,
      error: response.ok ? null : new Error(data.message || 'Failed to record swipe'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getSwipedJobs = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/matches`);
    const data = await response.json();
    return {
      data: data.matches || [],
      error: response.ok ? null : new Error(data.message || 'Failed to load matches'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getBadges = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/badges`);
    const data = await response.json();
    return {
      data: data.badges || [],
      error: response.ok ? null : new Error(data.message || 'Failed to load badges'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const awardBadge = async (userId: string, badge: any) => {
  try {
    const response = await fetch(`${API_BASE}/badges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...badge }),
    });
    const data = await response.json();
    return {
      data: data.id ? { id: data.id } : null,
      error: response.ok ? null : new Error(data.message || 'Failed to award badge'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const subscribeToApplications = (_userId: string, _callback: (payload: any) => void) => {
  return { unsubscribe: () => {} };
};

export const subscribeToNotifications = (_userId: string, _callback: (payload: any) => void) => {
  return { unsubscribe: () => {} };
};

// Application helpers
export const applyToJob = async (userId: string, jobId: string, coverLetter?: string) => {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, jobId, coverLetter }),
    });
    const data = await response.json();
    return {
      data: data.id ? { id: data.id } : null,
      error: response.ok ? null : new Error(data.error || 'Failed to submit application'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getUserApplications = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/applications`);
    const data = await response.json();
    return {
      data: data.applications || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch applications'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const createApplication = async (userId: string, jobId: string, coverLetter?: string) => {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, jobId, coverLetter }),
    });
    const data = await response.json();
    return {
      data: data.id ? { id: data.id } : null,
      error: response.ok ? null : new Error(data.error || 'Failed to create application'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
  try {
    const response = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to update application status'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

// Profile management
export const saveProfile = async (userId: string, profileData: any) => {
  try {
    const response = await fetch(`${API_BASE}/profiles/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to save profile'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const addSkill = async (userId: string, skillData: any) => {
  try {
    const response = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...skillData }),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to add skill'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const addExperience = async (userId: string, experienceData: any) => {
  try {
    const response = await fetch(`${API_BASE}/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...experienceData }),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to add experience'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const addEducation = async (userId: string, educationData: any) => {
  try {
    const response = await fetch(`${API_BASE}/education`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...educationData }),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to add education'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const deleteSkill = async (skillId: string) => {
  try {
    const response = await fetch(`${API_BASE}/skills/${skillId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to delete skill'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const deleteExperience = async (experienceId: string) => {
  try {
    const response = await fetch(`${API_BASE}/experience/${experienceId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to delete experience'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const deleteEducation = async (educationId: string) => {
  try {
    const response = await fetch(`${API_BASE}/education/${educationId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to delete education'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const updateSkill = async (skillId: string, skillData: any) => {
  try {
    const response = await fetch(`${API_BASE}/skills/${skillId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skillData),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to update skill'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const updateExperience = async (experienceId: string, experienceData: any) => {
  try {
    const response = await fetch(`${API_BASE}/experience/${experienceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(experienceData),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to update experience'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const updateEducation = async (educationId: string, educationData: any) => {
  try {
    const response = await fetch(`${API_BASE}/education/${educationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(educationData),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to update education'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getUserSkills = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/skills`);
    const data = await response.json();
    return {
      data: data.skills || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch skills'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getUserExperience = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/experience`);
    const data = await response.json();
    return {
      data: data.experience || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch experience'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getUserEducation = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/education`);
    const data = await response.json();
    return {
      data: data.education || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch education'),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const getCompanies = async () => {
  try {
    const response = await fetch(`${API_BASE}/companies`);
    const data = await response.json();
    return {
      data: data.companies || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch companies'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// ── JobSeeker Dashboard API ───────────────────────────────────────────────────

export const getJobSeekerDashboard = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/dashboard`);
    const data = await response.json();
    return { data: response.ok ? data : null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getJobSeekerFullProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/profile/full`);
    const data = await response.json();
    return { data: data.profile || null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const upsertJobSeekerProfile = async (userId: string, profileData: any) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    return { data: response.ok ? data : null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getProfileCompletion = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/profile/completion`);
    const data = await response.json();
    return { data: data.completion || null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getJobSeekerStatistics = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/statistics`);
    const data = await response.json();
    return { data: data.statistics || null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getLikedJobsForUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/liked-jobs`);
    const data = await response.json();
    return { data: data.jobs || [], error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getNotifications = async (userId: string, unreadOnly = false) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/notifications${unreadOnly ? '?unread=true' : ''}`);
    const data = await response.json();
    return { data: data.notifications || [], error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const markNotificationRead = async (notificationId: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return { data: response.ok ? data : null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const markAllNotificationsRead = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/notifications/read-all`, { method: 'PUT' });
    const data = await response.json();
    return { data: response.ok ? data : null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const recordProfileView = async (userId: string, viewerUserId?: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/profile/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerUserId }),
    });
    const data = await response.json();
    return { data: response.ok ? data : null, error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getJobRecommendations = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/recommendations`);
    const data = await response.json();
    return { data: data.recommendations || [], error: response.ok ? null : new Error(data.error) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getCompanyMetrics = async (companyId: string) => {
  try {
    const response = await fetch(`${API_BASE}/companies/${companyId}/metrics`);
    const data = await response.json();
    return {
      data: data.metrics || null,
      error: response.ok ? null : new Error(data.error || 'Failed to fetch metrics'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getCompanyAnalytics = async (companyId: string) => {
  try {
    const response = await fetch(`${API_BASE}/companies/${companyId}/analytics`);
    const data = await response.json();
    return {
      data: data.analytics || null,
      error: response.ok ? null : new Error(data.error || 'Failed to fetch analytics'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getCompanyCandidates = async (companyId: string, filters?: { status?: string; job_id?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.job_id) params.append('job_id', filters.job_id);
    const response = await fetch(`${API_BASE}/companies/${companyId}/candidates?${params}`);
    const data = await response.json();
    return {
      data: data.candidates || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch candidates'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getCompanyJobsFull = async (companyId: string) => {
  try {
    const response = await fetch(`${API_BASE}/companies/${companyId}/jobs/full`);
    const data = await response.json();
    return {
      data: data.jobs || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch jobs'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const updateCandidateStatus = async (applicationId: string, status: string, notes?: string) => {
  try {
    const response = await fetch(`${API_BASE}/candidates/${applicationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to update status'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getCandidateDetail = async (applicationId: string) => {
  try {
    const response = await fetch(`${API_BASE}/candidates/${applicationId}/detail`);
    const data = await response.json();
    return {
      data: data.candidate || null,
      error: response.ok ? null : new Error(data.error || 'Failed to fetch candidate'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const getCompanyMembers = async (companyId: string) => {
  try {
    const response = await fetch(`${API_BASE}/companies/${companyId}/members`);
    const data = await response.json();
    return {
      data: data.members || [],
      error: response.ok ? null : new Error(data.error || 'Failed to fetch members'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const addCompanyMember = async (companyId: string, userId: string, role = 'recruiter') => {
  try {
    const response = await fetch(`${API_BASE}/companies/${companyId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to add member'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const removeCompanyMember = async (companyId: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/companies/${companyId}/members/${userId}`, { method: 'DELETE' });
    const data = await response.json();
    return {
      data: response.ok ? data : null,
      error: response.ok ? null : new Error(data.error || 'Failed to remove member'),
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};