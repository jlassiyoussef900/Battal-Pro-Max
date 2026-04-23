export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'jobseeker' | 'company_admin' | 'recruiter' | 'hiring_manager';
          avatar_url: string | null;
          headline: string | null;
          summary: string | null;
          phone: string | null;
          linkedin: string | null;
          portfolio: string | null;
          city: string | null;
          region: string | null;
          country: string | null;
          remote: boolean;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          job_types: string[];
          industries: string[];
          company_sizes: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'jobseeker' | 'company_admin' | 'recruiter' | 'hiring_manager';
          avatar_url?: string | null;
          headline?: string | null;
          summary?: string | null;
          phone?: string | null;
          linkedin?: string | null;
          portfolio?: string | null;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          remote?: boolean;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          job_types?: string[];
          industries?: string[];
          company_sizes?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'jobseeker' | 'company_admin' | 'recruiter' | 'hiring_manager';
          avatar_url?: string | null;
          headline?: string | null;
          summary?: string | null;
          phone?: string | null;
          linkedin?: string | null;
          portfolio?: string | null;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          remote?: boolean;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          job_types?: string[];
          industries?: string[];
          company_sizes?: string[];
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          industry: string;
          size: 'startup' | 'sme' | 'enterprise';
          city: string;
          country: string;
          website: string | null;
          logo_url: string | null;
          founded: number | null;
          benefits: string[];
          created_at: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string;
          requirements: string[];
          responsibilities: string[];
          city: string | null;
          region: string | null;
          country: string;
          remote: boolean;
          hybrid: boolean;
          type: 'full-time' | 'part-time' | 'contract' | 'internship';
          experience_level: 'entry' | 'mid' | 'senior' | 'executive';
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          salary_period: 'hourly' | 'monthly' | 'yearly';
          skills: string[];
          industry: string;
          posted_at: string;
          expires_at: string | null;
          status: 'active' | 'expired' | 'draft' | 'closed';
          views: number;
          created_at: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          status: 'new' | 'shortlisted' | 'testing' | 'interview' | 'offer' | 'hired' | 'rejected';
          cover_letter: string | null;
          resume_url: string | null;
          notes: string | null;
          applied_at: string;
          updated_at: string;
        };
      };
      swiped_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          liked: boolean;
          swiped_at: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          category: string;
          description: string;
          duration: number;
          passing_score: number;
          questions: any[];
          is_active: boolean;
          created_at: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number;
          percentage: number;
          passed: boolean;
          answers: any;
          started_at: string;
          completed_at: string | null;
        };
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          level: 'bronze' | 'silver' | 'gold' | 'platinum';
          score: number;
          icon: string;
          earned_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          data: any;
          created_at: string;
        };
      };
      work_experience: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          position: string;
          location: string;
          start_date: string;
          end_date: string | null;
          current: boolean;
          description: string;
          achievements: string[];
          created_at: string;
        };
      };
      education: {
        Row: {
          id: string;
          user_id: string;
          institution: string;
          degree: string;
          field_of_study: string;
          start_date: string;
          end_date: string | null;
          current: boolean;
          gpa: number | null;
          created_at: string;
        };
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: 'technical' | 'soft' | 'language' | 'industry';
          proficiency: number;
          created_at: string;
        };
      };
    };
  };
}
