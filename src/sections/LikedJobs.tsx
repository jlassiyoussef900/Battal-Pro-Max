import { useState, useEffect } from 'react';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Heart, Building2, Star, CheckCircle, MapPin, Briefcase, DollarSign, Send, Info, Code, Bookmark, X } from 'lucide-react';
import { Job } from '@/types';

export function LikedJobs() {
  const { swipedJobs, getJobMatches, companies, applyToJob, applications, refresh } = useData();
  const [showDetail, setShowDetail] = useState<Job | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch jobs when component mounts
  useEffect(() => {
    refresh.jobs();
    refresh.companies();
    refresh.applications();
  }, []);

  const matches = getJobMatches();

  // Get liked jobs directly - filtering out those we've already applied for
  const likedJobs = matches.filter(m => 
    swipedJobs.find(s => s.liked && s.jobId === m.job.id) &&
    !applications.some(app => app.jobId === m.job.id)
  );

  const getCompany = (job: Job) => {
    return companies.find(c => c.id === job.companyId) || { name: 'Unknown Company', logo: undefined };
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-muted-foreground bg-muted';
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApply = async (jobId: string) => {
    console.log('Applying to job:', jobId);
    console.log('Current applications:', applications);
    
    if (applications.some(app => app.jobId === jobId)) {
      showToast('You have already applied to this job.', 'error');
      return;
    }

    const jobMatch = matches.find(m => m.job.id === jobId);
    const job = jobMatch?.job;
    const company = job ? getCompany(job) : null;
    
    console.log('Applying to:', job?.title, 'at', company?.name);
    
    try {
      const { error } = await applyToJob(jobId);
      console.log('Apply result - error:', error);
      
      if (error) {
        showToast('Failed to submit application. Please try again.', 'error');
      } else {
        const msg = job
          ? `Applied to ${job.title} at ${company?.name || 'the company'}! ✓`
          : 'Application submitted successfully! ✓';
        showToast(msg, 'success');
        setShowDetail(null);
        // Refresh applications
        refresh.applications();
      }
    } catch (err) {
      console.error('Apply error:', err);
      showToast('An unexpected error occurred. Please try again.', 'error');
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-slide-up max-w-sm ${
            toast.type === 'success'
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Liked Jobs</h2>
          <p className="text-muted-foreground">
            {likedJobs.length} jobs you've swiped right on
          </p>
        </div>
      </div>

      {likedJobs.length > 0 ? (
        <div className="space-y-4">
          {likedJobs.map((match) => {
            const job = match.job;
            const company = getCompany(job);
            const hasApplied = applications.some(app => app.jobId === job.id);
            const swipedInfo = swipedJobs.find(s => s.jobId === job.id);

            return (
              <Card key={job.id} className="glass-card card-hover overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      {company?.logo ? (
                        <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{job.title}</h4>
                        <Badge className={`${getMatchColor(match.compatibilityScore)} border`}>
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {match.compatibilityScore}% Match
                        </Badge>
                        {hasApplied && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Applied
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {company?.name} • {job.location?.remote ? 'Remote' : (job.location?.city || 'Location TBD')}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {(Array.isArray(job.skills) ? job.skills : []).slice(0, 4).map((skill, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
                            {String(skill)}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Liked {swipedInfo?.timestamp?.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!hasApplied ? (
                        <Button size="sm" onClick={() => handleApply(job.id)}>
                          <Send className="w-4 h-4 mr-2" />
                          Apply
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Applied
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setShowDetail(job)}>
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 glass-card border-dashed border-2 border-indigo-100/50 dark:border-white/5 rounded-[2.5rem]">
          <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/5 animate-float">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No liked jobs yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg leading-relaxed">
            Start swiping in Discover to build your wishlist and find your perfect match.
          </p>
          <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'jobs' }))} className="rounded-xl px-10">
            Start Discovering
          </Button>
        </div>
      )}

      {/* Job Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showDetail && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{showDetail.title}</DialogTitle>
                    <DialogDescription className="text-lg">
                      {getCompany(showDetail).name} • {showDetail.location?.city || 'Remote'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {showDetail.type.replace('-', ' ')}
                  </Badge>
                  {showDetail.location?.remote && (
                    <Badge variant="secondary">
                      <MapPin className="w-4 h-4 mr-2" />
                      Remote
                    </Badge>
                  )}
                  {showDetail.salary && (
                    <Badge variant="secondary">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ${(showDetail.salary.min / 1000).toFixed(0)}k - {(showDetail.salary.max / 1000).toFixed(0)}k
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">About the Role</h4>
                  <p className="text-muted-foreground">{(() => {
                    let desc = showDetail.description || '';
                    desc = desc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                    desc = desc.replace(/\{[^}]*\}/g, '');
                    desc = desc.replace(/\s+/g, ' ').trim();
                    return desc;
                  })()}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-2">
                    {(Array.isArray(showDetail.requirements) ? showDetail.requirements : []).map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        {String(req)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Responsibilities</h4>
                  <ul className="space-y-2">
                    {(Array.isArray(showDetail.responsibilities) ? showDetail.responsibilities : []).map((resp, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        {String(resp)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(showDetail.skills) ? showDetail.skills : []).map((skill, i) => (
                      <Badge key={i} variant="secondary">
                        <Code className="w-3 h-3 mr-1" />
                        {String(skill)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {!applications.some(app => app.jobId === showDetail.id) ? (
                    <Button className="flex-1" onClick={() => handleApply(showDetail.id)}>
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  ) : (
                    <Button className="flex-1" variant="secondary" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Applied
                    </Button>
                  )}
                  <Button variant="outline">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
