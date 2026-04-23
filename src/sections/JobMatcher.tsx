import { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Heart,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  TrendingUp,
  Code,
  CheckCircle,
  Star,
  RotateCcw,
  Info,
  Send,
  Bookmark,
  SlidersHorizontal,
  Search,
  BarChart3,
  Users,
  Globe,
  Award,
  ExternalLink,
} from 'lucide-react';
import { Job, JobMatch } from '@/types';

interface SwipedJob {
  jobId: string;
  liked: boolean;
  timestamp: Date;
}

export function JobMatcher() {
  const { jobs, profile, swipedJobs, companies, getJobMatches, swipeJob, undoSwipe, applyToJob, applications, isLoading, error, hasMoreJobs, loadMoreJobs, refresh } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localSwipedJobs, setLocalSwipedJobs] = useState<SwipedJob[]>([]);
  const [showDetail, setShowDetail] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [researchQuery, setResearchQuery] = useState('');
  const [researchType, setResearchType] = useState<'company' | 'salary' | 'trends'>('company');
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch jobs when component mounts
  useEffect(() => {
    refresh.jobs();
    refresh.companies();
    refresh.applications();
  }, []);

  // Filters
  const defaultFilters = {
    remote: false,
    hybrid: false,
    jobTypes: [] as string[],
    experienceLevels: [] as string[],
    industries: [] as string[],
    salaryMin: 0,
    salaryMax: 200000,
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState(defaultFilters);

  // Combine global swiped jobs with local ones
  const allSwipedJobs = useMemo(() => {
    return [...swipedJobs, ...localSwipedJobs];
  }, [swipedJobs, localSwipedJobs]);

  const matches = getJobMatches();

  // Snapshot the initial swiped IDs so the array doesn't shrink during active swiping
  // which was causing currentIndex to skip elements
  const initialSwipedIds = useRef(swipedJobs.map(s => s.jobId)).current;
  const initialAppliedIds = useRef(applications.map(a => a.jobId)).current;

  // Filter out already swiped jobs (from previous sessions) AND jobs already applied for
  const availableJobs = useMemo(() => {
    return matches.filter(m =>
      !initialSwipedIds.includes(m.job.id) &&
      !initialAppliedIds.includes(m.job.id)
    );
  }, [matches, initialSwipedIds, initialAppliedIds]);

  // Apply active filters to the swiped-excluded pool
  const filteredJobs = useMemo(() => {
    return availableJobs.filter(m => {
      const job = m.job;
      if (filters.remote && !job.location.remote) return false;
      if (filters.hybrid && !job.location.hybrid) return false;
      if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.type)) return false;
      if (filters.experienceLevels.length > 0 && !filters.experienceLevels.includes(job.experienceLevel)) return false;
      if (filters.industries.length > 0 && !filters.industries.includes(job.industry)) return false;
      if (job.salary) {
        if (job.salary.max < filters.salaryMin) return false;
        if (job.salary.min > filters.salaryMax) return false;
      }
      return true;
    });
  }, [availableJobs, filters]);

  // Number of active filter criteria (for badge)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.remote) count++;
    if (filters.hybrid) count++;
    if (filters.jobTypes.length > 0) count++;
    if (filters.experienceLevels.length > 0) count++;
    if (filters.industries.length > 0) count++;
    if (filters.salaryMin > 0 || filters.salaryMax < 200000) count++;
    return count;
  }, [filters]);

  // All unique industries derived from the full job pool
  const allIndustries = useMemo(() => {
    const set = new Set(jobs.map(j => j.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [jobs]);

  // Search-filtered subset of filtered jobs
  const searchedJobs = useMemo(() => {
    if (!searchQuery.trim()) return filteredJobs;
    const q = searchQuery.toLowerCase().trim();
    return filteredJobs.filter(m => {
      const job = m.job;
      const company = companies.find(c => c.id === job.companyId);
      return (
        job.title.toLowerCase().includes(q) ||
        job.industry.toLowerCase().includes(q) ||
        (job.location.city ?? '').toLowerCase().includes(q) ||
        (job.location.country ?? '').toLowerCase().includes(q) ||
        (company?.name ?? '').toLowerCase().includes(q) ||
        job.skills.some(s => String(s).toLowerCase().includes(q))
      );
    });
  }, [filteredJobs, searchQuery, companies]);

  // Reset card index whenever the search query or filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery, filters]);

  // Get liked jobs
  const likedJobs = useMemo(() => {
    const likedIds = allSwipedJobs.filter(s => s.liked).map(s => s.jobId);
    return matches.filter(m => likedIds.includes(m.job.id));
  }, [matches, allSwipedJobs]);

  const currentJob = searchedJobs[currentIndex];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSwipe = async (liked: boolean) => {
    if (!currentJob || isAnimating) return;

    setIsAnimating(true);
    setDirection(liked ? 'right' : 'left');

    // Save to global state
    swipeJob(currentJob.job.id, liked);

    setTimeout(() => {
      setLocalSwipedJobs(prev => [...prev, { jobId: currentJob.job.id, liked, timestamp: new Date() }]);
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setIsAnimating(false);
      
      // Load more jobs when approaching the end (5 jobs remaining)
      if (searchedJobs.length - currentIndex <= 5 && hasMoreJobs && !isLoading) {
        loadMoreJobs();
      }
    }, 300);
  };

  const handleUndo = () => {
    if (localSwipedJobs.length === 0) return;
    undoSwipe();
    setLocalSwipedJobs(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleApply = async (jobId: string) => {
    // Prevent double-applying
    if (applications.some(app => app.jobId === jobId)) {
      showToast('You have already applied to this job.', 'error');
      return;
    }

    const jobMatch = matches.find(m => m.job.id === jobId);
    const job = jobMatch?.job;
    const company = job ? getCompany(job) : null;

    try {
      const { error } = await applyToJob(jobId);
      if (error) {
        console.error('Application error:', error);
        showToast('Failed to submit application. Please try again.', 'error');
      } else {
        const msg = job
          ? `Applied to ${job.title} at ${company?.name || 'the company'}! ✓`
          : 'Application submitted successfully! ✓';
        showToast(msg, 'success');
        setShowDetail(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('An unexpected error occurred. Please try again.', 'error');
    }
  };

  const getCompany = (job: Job) => {
    return companies.find(c => c.id === job.companyId) || { name: 'Unknown Company', logo: undefined };
  };

  // Robust description cleaner:
  // 1. If the whole value is a JSON object, try to extract a real description from it.
  // 2. Iteratively strips nested {…} and […] until none remain.
  // 3. Decodes common HTML entities and collapses whitespace.
  const cleanDescription = (raw: string | null | undefined): string => {
    if (!raw) return '';
    let desc = raw.trim();

    // If the value looks like a JSON object/array, try to parse and extract text
    if (desc.startsWith('{') || desc.startsWith('[')) {
      try {
        const parsed = JSON.parse(desc);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          // Extract the first meaningful text field we can find
          desc = parsed.description || parsed.summary || parsed.about || parsed.content || '';
        } else {
          desc = '';
        }
      } catch {
        // Not valid JSON — fall through to regex cleanup
      }
    }

    // Decode HTML entities
    desc = desc
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'");

    // Iteratively remove nested JSON-like blocks until stable
    let prev = '';
    while (prev !== desc) {
      prev = desc;
      desc = desc.replace(/\{[^{}]*\}/g, '').replace(/\[[^\[\]]*\]/g, '');
    }

    // Remove any leftover bare JSON-looking fragments (e.g. stray keys/values)
    desc = desc.replace(/"[^"]*"\s*:/g, '').replace(/:\s*"[^"]*"/g, '');
    desc = desc.replace(/:\s*(null|true|false|\d+)/g, '');

    // Collapse whitespace and trim
    return desc.replace(/\s+/g, ' ').trim();
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-muted-foreground bg-muted';
  };

  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'bronze': return 'badge-bronze';
      case 'silver': return 'badge-silver';
      case 'gold': return 'badge-gold';
      case 'platinum': return 'badge-platinum';
      default: return 'bg-muted';
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe(false);
      if (e.key === 'ArrowRight') handleSwipe(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentJob, isAnimating]);

  const renderJobCard = (jobMatch: JobMatch, isPreview: boolean = false) => {
    const job = jobMatch.job;
    const company = getCompany(job);

    // Safety checks
    if (!job || !job.id) {
      console.error('Invalid job data:', job);
      return null;
    }

    const skills = Array.isArray(job.skills) ? job.skills : [];
    const requirements = Array.isArray(job.requirements) ? job.requirements : [];
    const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];

    return (
      <div
        className={`relative w-full max-w-md mx-auto ${isPreview ? '' : 'h-[720px]'}`}
        style={{ touchAction: 'none' }}
      >
        {/* Card Stack Container */}
        <div className={`relative w-full ${isPreview ? '' : 'h-[600px]'}`}>
          <Card
            className={`absolute inset-0 overflow-hidden border-2 transition-all duration-300 ${direction === 'right' && !isPreview
                ? 'translate-x-full rotate-12 opacity-0'
                : direction === 'left' && !isPreview
                  ? '-translate-x-full -rotate-12 opacity-0'
                  : ''
              } ${!isPreview ? 'glass-card border-indigo-100/50 shadow-2xl shadow-indigo-500/10' : ''}`}
          >
            {/* Company Header Image */}
            <div className="h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-background relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-card border-2 border-white/10 flex items-center justify-center shadow-xl">
                  {company?.logo ? (
                    <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
              </div>
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4">
                <Badge className={`${getMatchColor(jobMatch.compatibilityScore)} border`}>
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {jobMatch.compatibilityScore}% Match
                </Badge>
              </div>
            </div>

            {/* Job Content */}
            <CardContent className="p-6 pt-12">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                <p className="text-muted-foreground">{company?.name}</p>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {job.location?.remote ? 'Remote' : (job.location?.city || 'Location TBD')}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {job.type.replace('-', ' ')}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {job.experienceLevel}
                </Badge>
                {job.salary && (
                  <Badge variant="secondary" className="text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${(job.salary.min / 1000).toFixed(0)}k
                  </Badge>
                )}
              </div>

              {/* Match Breakdown */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Skills</p>
                  <p className={`text-sm font-semibold ${jobMatch.skillsMatch >= 80 ? 'text-green-400' : ''}`}>
                    {jobMatch.skillsMatch}%
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Exp</p>
                  <p className={`text-sm font-semibold ${jobMatch.experienceMatch >= 80 ? 'text-green-400' : ''}`}>
                    {jobMatch.experienceMatch}%
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Loc</p>
                  <p className={`text-sm font-semibold ${jobMatch.locationMatch >= 80 ? 'text-green-400' : ''}`}>
                    {jobMatch.locationMatch}%
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Pay</p>
                  <p className={`text-sm font-semibold ${jobMatch.salaryMatch >= 80 ? 'text-green-400' : ''}`}>
                    {jobMatch.salaryMatch}%
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Ind</p>
                  <p className={`text-sm font-semibold ${jobMatch.industryMatch >= 80 ? 'text-green-400' : ''}`}>
                    {jobMatch.industryMatch}%
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap justify-center gap-1 mb-4">
                {skills.slice(0, 5).map((skill, i) => {
                  const hasSkill = profile?.skills?.some(s => s.name.toLowerCase() === String(skill).toLowerCase()) || false;
                  return (
                    <Badge
                      key={i}
                      variant={hasSkill ? 'default' : 'secondary'}
                      className={`text-xs ${hasSkill ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : ''}`}
                    >
                      {hasSkill && <CheckCircle className="w-2 h-2 mr-1" />}
                      {String(skill)}
                    </Badge>
                  );
                })}
                {skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">+{skills.length - 5}</Badge>
                )}
              </div>

              {/* Description Preview */}
              {cleanDescription(job.description) && (
                <p className="text-sm text-muted-foreground text-center line-clamp-3">
                  {cleanDescription(job.description)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Next Card Preview */}
          {!isPreview && availableJobs[currentIndex + 1] && (
            <div
              className="absolute inset-0 scale-95 opacity-50 -z-10"
              style={{ transform: 'translateY(10px) scale(0.95)' }}
            >
              <Card className="h-full border-2 border-border/50 shadow-sm dark:shadow-none" />
            </div>
          )}
        </div>

        {/* Action Buttons beneath the card container */}
        {!isPreview && !showDetail && (
          <div className="mt-8 flex items-center justify-center gap-8 animate-fade-in relative z-10">
            <button
              onClick={() => handleSwipe(false)}
              className="w-20 h-20 rounded-full bg-white dark:bg-red-500/10 text-red-500 border-2 border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-500 flex items-center justify-center shadow-xl shadow-red-500/10 group active:scale-90"
              aria-label="Not interested"
            >
              <X className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <button
              onClick={() => setShowDetail(job)}
              className="w-16 h-16 rounded-full bg-white dark:bg-muted/50 text-muted-foreground border-2 border-indigo-50 dark:border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-500 flex items-center justify-center shadow-lg shadow-indigo-500/5 group active:scale-90"
              aria-label="View details"
            >
              <Info className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => handleSwipe(true)}
              className="w-20 h-20 rounded-full bg-white dark:bg-green-500/10 text-green-500 border-2 border-green-100 dark:border-green-500/20 hover:bg-green-500 hover:text-white transition-all duration-500 flex items-center justify-center shadow-xl shadow-green-500/10 group active:scale-90"
              aria-label="Like job"
            >
              <Heart className="w-10 h-10 group-hover:scale-125 transition-transform duration-500 fill-transparent group-hover:fill-current" />
            </button>
          </div>
        )}

        {/* Integrated Detail Overlay */}
        {!isPreview && showDetail?.id === job.id && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center">
            <div 
              className="w-[115%] max-w-4xl bg-card border-2 border-primary/30 rounded-[2rem] shadow-2xl dark:shadow-[0_30px_70px_rgba(0,0,0,0.7)] overflow-hidden animate-slide-up flex flex-col h-full max-h-[650px] relative"
              style={{ width: 'min(90vw, 680px)' }}
            >
              <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-none">{job.title}</h4>
                    <p className="text-xs text-muted-foreground">{company?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetail(null)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-2 py-1">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                    {job.type.replace('-', ' ')}
                  </Badge>
                  <Badge variant="secondary" className="px-2 py-1">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                    {job.experienceLevel}
                  </Badge>
                  {job.location?.remote && (
                    <Badge variant="secondary" className="px-2 py-1">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      Remote
                    </Badge>
                  )}
                  {job.salary && (
                    <Badge variant="secondary" className="px-2 py-1">
                      <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                      ${(job.salary.min / 1000).toFixed(0)}k - {(job.salary.max / 1000).toFixed(0)}k
                    </Badge>
                  )}
                </div>

                {cleanDescription(job.description) && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">About the Role</h5>
                    <p className="text-sm text-foreground/90 leading-relaxed">{cleanDescription(job.description)}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requirements.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Requirements</h5>
                      <ul className="space-y-2">
                        {requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {String(req)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {responsibilities.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Responsibilities</h5>
                      <ul className="space-y-2">
                        {responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            {String(resp)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Required Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="px-2 py-1 bg-primary/5 border-primary/20">
                        <Code className="w-3 h-3 mr-1.5" />
                        {String(skill)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 border-t flex gap-3">
                <Button 
                  className="flex-1 rounded-xl py-6 font-bold text-lg shadow-lg shadow-primary/20"
                  onClick={() => handleApply(job.id)}
                >
                  Apply Now
                  <Send className="w-5 h-5 ml-2" />
                </Button>
                <button
                  onClick={() => setShowDetail(null)}
                  className="px-6 rounded-xl bg-card border hover:bg-muted transition-colors font-medium text-sm"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Next Card Preview */}
        {!isPreview && availableJobs[currentIndex + 1] && (
          <div
            className="absolute inset-0 scale-95 opacity-50 -z-10"
            style={{ transform: 'translateY(10px) scale(0.95)' }}
          >
            <Card className="h-full border-2 border-border/50" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* In-App Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-slide-up max-w-sm ${toast.type === 'success'
              ? 'bg-green-900/90 border-green-500/40 text-green-100'
              : 'bg-red-900/90 border-red-500/40 text-red-100'
            }`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            : <X className="w-5 h-5 text-red-400 flex-shrink-0" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Discover Jobs</h2>
            <p className="text-muted-foreground">
              {isLoading
                ? 'Loading jobs…'
                : error
                ? 'Error loading jobs'
                : searchQuery.trim()
                ? `${searchedJobs.length} result${searchedJobs.length !== 1 ? 's' : ''} for "${searchQuery.trim()}"`
                : activeFilterCount > 0
                ? `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} match your filters`
                : `${availableJobs.length} jobs waiting for you`}
            </p>
          </div>
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setPendingFilters(filters); setShowFilters(true); }}
            className="relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              id="discover-jobs-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, company, skill, location…"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {searchedJobs.length} match{searchedJobs.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.remote && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                Remote
                <button onClick={() => setFilters(f => ({ ...f, remote: false }))} aria-label="Remove remote filter">
                  <X className="w-3 h-3 hover:opacity-70" />
                </button>
              </span>
            )}
            {filters.hybrid && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                Hybrid
                <button onClick={() => setFilters(f => ({ ...f, hybrid: false }))} aria-label="Remove hybrid filter">
                  <X className="w-3 h-3 hover:opacity-70" />
                </button>
              </span>
            )}
            {filters.jobTypes.map(type => (
              <span key={type} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium capitalize">
                {type.replace('-', '\u2011')}
                <button onClick={() => setFilters(f => ({ ...f, jobTypes: f.jobTypes.filter(t => t !== type) }))} aria-label={`Remove ${type} filter`}>
                  <X className="w-3 h-3 hover:opacity-70" />
                </button>
              </span>
            ))}
            {filters.experienceLevels.map(level => (
              <span key={level} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium capitalize">
                {level}
                <button onClick={() => setFilters(f => ({ ...f, experienceLevels: f.experienceLevels.filter(l => l !== level) }))} aria-label={`Remove ${level} filter`}>
                  <X className="w-3 h-3 hover:opacity-70" />
                </button>
              </span>
            ))}
            {filters.industries.map(ind => (
              <span key={ind} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                {ind}
                <button onClick={() => setFilters(f => ({ ...f, industries: f.industries.filter(i => i !== ind) }))} aria-label={`Remove ${ind} filter`}>
                  <X className="w-3 h-3 hover:opacity-70" />
                </button>
              </span>
            ))}
            {(filters.salaryMin > 0 || filters.salaryMax < 200000) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                ${(filters.salaryMin / 1000).toFixed(0)}k – ${(filters.salaryMax / 1000).toFixed(0)}k
                <button onClick={() => setFilters(f => ({ ...f, salaryMin: 0, salaryMax: 200000 }))} aria-label="Remove salary filter">
                  <X className="w-3 h-3 hover:opacity-70" />
                </button>
              </span>
            )}
            <button
              onClick={() => setFilters(defaultFilters)}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading your job matches...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-medium mb-2">Failed to load jobs</div>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => refresh.jobs()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Job Cards - Only show when not loading and no error */}
        {!isLoading && !error && (
          <div className="mt-0">
            {currentJob ? (
              <div className="relative">
                {/* Undo Button */}
                {localSwipedJobs.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-muted hover:bg-primary/20 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}

                {/* Job Card */}
                <div className="py-8">
                  {renderJobCard(currentJob)}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  {searchQuery.trim() || activeFilterCount > 0
                    ? <SlidersHorizontal className="w-12 h-12 text-muted-foreground" />
                    : <Bookmark className="w-12 h-12 text-muted-foreground" />}
                </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery.trim()
                  ? `No jobs found for "${searchQuery.trim()}"`
                  : activeFilterCount > 0
                  ? 'No jobs match your filters'
                  : 'No more jobs'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery.trim()
                  ? 'Try a different keyword, skill, or company name.'
                  : activeFilterCount > 0
                  ? 'Try removing some filters to see more results.'
                  : "You've seen all available jobs."}
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {searchQuery.trim() && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Search
                  </Button>
                )}
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                )}
                {!searchQuery.trim() && activeFilterCount === 0 && (
                  <Button onClick={() => { setLocalSwipedJobs([]); setCurrentIndex(0); }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filter Jobs
            </DialogTitle>
            <DialogDescription>
              Narrow down job matches using the options below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-2">

            {/* Work Location */}
            <div>
              <p className="text-sm font-semibold mb-3 text-foreground">Work Location</p>
              <div className="flex gap-3">
                {[
                  { key: 'remote' as const, label: 'Remote' },
                  { key: 'hybrid' as const, label: 'Hybrid' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setPendingFilters(p => ({ ...p, [key]: !p[key] }))}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      pendingFilters[key]
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div>
              <p className="text-sm font-semibold mb-3 text-foreground">Job Type</p>
              <div className="flex flex-wrap gap-2">
                {(['full-time', 'part-time', 'contract', 'internship'] as const).map(type => {
                  const active = pendingFilters.jobTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() =>
                        setPendingFilters(p => ({
                          ...p,
                          jobTypes: active
                            ? p.jobTypes.filter(t => t !== type)
                            : [...p.jobTypes, type],
                        }))
                      }
                      className={`px-4 py-2 rounded-full border text-sm font-medium capitalize transition-all ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {type.replace('-', '\u2011')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <p className="text-sm font-semibold mb-3 text-foreground">Experience Level</p>
              <div className="flex flex-wrap gap-2">
                {(['entry', 'mid', 'senior', 'executive'] as const).map(level => {
                  const active = pendingFilters.experienceLevels.includes(level);
                  return (
                    <button
                      key={level}
                      onClick={() =>
                        setPendingFilters(p => ({
                          ...p,
                          experienceLevels: active
                            ? p.experienceLevels.filter(l => l !== level)
                            : [...p.experienceLevels, level],
                        }))
                      }
                      className={`px-4 py-2 rounded-full border text-sm font-medium capitalize transition-all ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <p className="text-sm font-semibold mb-3 text-foreground">Salary Range (per year)</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      min={0}
                      max={pendingFilters.salaryMax}
                      step={5000}
                      value={pendingFilters.salaryMin}
                      onChange={e =>
                        setPendingFilters(p => ({ ...p, salaryMin: Number(e.target.value) }))
                      }
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <span className="text-muted-foreground mt-5">–</span>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      min={pendingFilters.salaryMin}
                      max={500000}
                      step={5000}
                      value={pendingFilters.salaryMax}
                      onChange={e =>
                        setPendingFilters(p => ({ ...p, salaryMax: Number(e.target.value) }))
                      }
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ${(pendingFilters.salaryMin / 1000).toFixed(0)}k – ${(pendingFilters.salaryMax / 1000).toFixed(0)}k
              </p>
            </div>

            {/* Industries */}
            {allIndustries.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3 text-foreground">Industry</p>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  {allIndustries.map(industry => {
                    const active = pendingFilters.industries.includes(industry);
                    return (
                      <button
                        key={industry}
                        onClick={() =>
                          setPendingFilters(p => ({
                            ...p,
                            industries: active
                              ? p.industries.filter(i => i !== industry)
                              : [...p.industries, industry],
                          }))
                        }
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {industry}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 mt-2 border-t border-border">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setPendingFilters(defaultFilters);
                setFilters(defaultFilters);
                setShowFilters(false);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setFilters(pendingFilters);
                setShowFilters(false);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Research Tool Dialog */}
      <Dialog open={showResearch} onOpenChange={setShowResearch}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Job Market Research
            </DialogTitle>
            <DialogDescription>
              Research companies, salaries, and job market trends to make informed decisions
            </DialogDescription>
          </DialogHeader>

          <Tabs value={researchType} onValueChange={(v) => setResearchType(v as any)} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="company">
                <Building2 className="w-4 h-4 mr-2" />
                Companies
              </TabsTrigger>
              <TabsTrigger value="salary">
                <DollarSign className="w-4 h-4 mr-2" />
                Salaries
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>

            {/* Company Research */}
            <TabsContent value="company" className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border bg-background"
                />
                <Button>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                {companies.filter(c => 
                  !researchQuery || c.name.toLowerCase().includes(researchQuery.toLowerCase())
                ).map(company => (
                  <Card key={company.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">{company.name}</h3>
                              <p className="text-sm text-muted-foreground">{company.industry}</p>
                            </div>
                            <Badge variant="secondary">
                              <Users className="w-3 h-3 mr-1" />
                              {company.size}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{company.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {company.location?.city || 'N/A'}, {company.location?.country || 'N/A'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Founded {company.founded}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {company.benefits?.slice(0, 4).map((benefit, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                            {company.benefits && company.benefits.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{company.benefits.length - 4}</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer">
                                <Globe className="w-3 h-3 mr-1" />
                                Website
                              </a>
                            </Button>
                            <Button size="sm" variant="outline">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {jobs.filter(j => j.companyId === company.id).length} Open Jobs
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Salary Research */}
            <TabsContent value="salary" className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search job titles..."
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border bg-background"
                />
                <Button>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                {jobs.filter(j => 
                  j.salary && (!researchQuery || j.title.toLowerCase().includes(researchQuery.toLowerCase()))
                ).map(job => {
                  const company = getCompany(job);
                  const avgSalary = job.salary ? (job.salary.min + job.salary.max) / 2 : 0;
                  return (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{company.name}</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${(avgSalary / 1000).toFixed(0)}k avg
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Salary Range:</span>
                            <span className="font-semibold">
                              ${(job.salary!.min / 1000).toFixed(0)}k - ${(job.salary!.max / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Experience Level:</span>
                            <Badge variant="secondary" className="text-xs">{job.experienceLevel}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span>{job.location?.remote ? 'Remote' : (job.location?.city || 'Location TBD')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Job Type:</span>
                            <span>{job.type.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${((avgSalary - 50000) / 150000) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>$50k</span>
                            <span>$200k</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Market Trends */}
            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4">
                {/* Top Skills in Demand */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Top Skills in Demand
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const skillCounts: Record<string, number> = {};
                        jobs.forEach(job => {
                          job.skills.forEach(skill => {
                            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                          });
                        });
                        return Object.entries(skillCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([skill, count]) => (
                            <div key={skill} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{skill}</span>
                                  <span className="text-xs text-muted-foreground">{count} jobs</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(count / jobs.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Industry Distribution */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Jobs by Industry
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const industryCounts: Record<string, number> = {};
                        jobs.forEach(job => {
                          industryCounts[job.industry] = (industryCounts[job.industry] || 0) + 1;
                        });
                        return Object.entries(industryCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([industry, count]) => (
                            <div key={industry} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{industry}</span>
                                  <span className="text-xs text-muted-foreground">{count} jobs ({((count / jobs.length) * 100).toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(count / jobs.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Remote vs On-site */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Work Location Trends
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(() => {
                        const remote = jobs.filter(j => j.location.remote).length;
                        const hybrid = jobs.filter(j => j.location.hybrid).length;
                        const onsite = jobs.length - remote - hybrid;
                        return [
                          { label: 'Remote', count: remote, color: 'bg-green-500' },
                          { label: 'Hybrid', count: hybrid, color: 'bg-blue-500' },
                          { label: 'On-site', count: onsite, color: 'bg-orange-500' },
                        ].map(({ label, count, color }) => (
                          <div key={label} className="text-center p-4 rounded-lg bg-muted">
                            <div className={`w-12 h-12 rounded-full ${color} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                              {count}
                            </div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{((count / jobs.length) * 100).toFixed(0)}%</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
