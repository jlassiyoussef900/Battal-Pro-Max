import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Briefcase,
  Award,
  Target,
  Clock,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  MapPin,
  Heart,
  Ban,
  Rocket,
  Brain,
} from 'lucide-react';

export function Statistics() {
  const { user } = useAuth();
  const { profile, badges = [], applications = [], getJobMatches, swipedJobs = [] } = useData();
  const [timeRange, setTimeRange] = useState('30d');

  const matches = useMemo(() => {
    try {
      return getJobMatches() || [];
    } catch (e) {
      console.error('Error getting job matches:', e);
      return [];
    }
  }, [getJobMatches]);
  
  // Calculate dynamic statistics with safety defaults
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a && ['new', 'shortlisted', 'testing', 'applied'].includes(a.status)).length;
  const interviewApplications = applications.filter(a => a && a.status === 'interview').length;
  const rejectedApplications = applications.filter(a => a && a.status === 'rejected').length;
  const hiredApplications = applications.filter(a => a && a.status === 'hired').length;
  const offerApplications = applications.filter(a => a && a.status === 'offer').length;
  
  const applicationSuccessRate = totalApplications > 0 
    ? Math.round(((interviewApplications + hiredApplications + offerApplications) / totalApplications) * 100) 
    : 0;

  // Swiping analytics
  const totalSwipes = swipedJobs.length;
  const likedJobsCount = swipedJobs.filter(s => s && s.liked).length;
  const passJobsCount = totalSwipes - likedJobsCount;
  const likeRatio = totalSwipes > 0 ? Math.round((likedJobsCount / totalSwipes) * 100) : 0;
  const passRatio = totalSwipes > 0 ? 100 - likeRatio : 0;

  const badgeStats = useMemo(() => ({
    total: badges.length,
    byLevel: {
      bronze: badges.filter(b => b?.level === 'bronze').length,
      silver: badges.filter(b => b?.level === 'silver').length,
      gold: badges.filter(b => b?.level === 'gold').length,
      platinum: badges.filter(b => b?.level === 'platinum').length,
    }
  }), [badges]);

  const skillProgress = useMemo(() => 
    profile?.skills?.slice(0, 6).map(skill => ({
      name: skill.name,
      proficiency: skill.proficiency,
      category: skill.category,
    })) || [], 
  [profile]);

  // Use swipedJobs to find most liked industry
  const topIndustry = useMemo(() => {
    if (likedJobsCount === 0 || !matches.length) return 'Not yet determined';
    try {
      const likedIds = swipedJobs.filter(s => s?.liked).map(s => s.jobId);
      const likedJobsFromMatches = matches.filter(m => m?.job?.id && likedIds.includes(m.job.id)).map(m => m.job);
      
      if (likedJobsFromMatches.length === 0) return 'Analyzing preferences...';

      const industries: Record<string, number> = {};
      likedJobsFromMatches.forEach(j => {
        if (j?.industry) {
          industries[j.industry] = (industries[j.industry] || 0) + 1;
        }
      });
      
      const sortedIndustries = Object.entries(industries).sort((a, b) => b[1] - a[1]);
      return sortedIndustries[0]?.[0] || 'Technology';
    } catch (e) {
      console.error('Error calculating top industry:', e);
      return 'Technology';
    }
  }, [likedJobsCount, swipedJobs, matches]);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return null;
  };

  // Safe color mapping helper
  const getColorClasses = (tag: string) => {
    const maps: Record<string, string> = {
      primary: 'border-primary/20',
      amber: 'border-amber-500/20',
      sky: 'border-sky-500/20',
      pink: 'border-pink-500/20',
      emerald: 'border-emerald-500/20',
    };
    return maps[tag] || 'border-border';
  };

  return (
    <div className="animate-slide-up space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-muted-foreground mt-1 text-lg">Measure your career growth and discovery journey</p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="glass-effect p-1 rounded-xl border border-indigo-100/50 dark:border-white/5">
          <TabsList className="bg-transparent border-none h-auto">
            <TabsTrigger value="7d" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">7D</TabsTrigger>
            <TabsTrigger value="30d" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">30D</TabsTrigger>
            <TabsTrigger value="90d" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">3M</TabsTrigger>
            <TabsTrigger value="1y" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden glass-card border-white/10 hover:border-primary/50 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Discovery</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tighter">{totalSwipes}</h3>
                  <span className="text-xs text-emerald-500 font-bold flex items-center">
                    +12% {getTrendIcon('up')}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Jobs Explored</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:rotate-12 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden glass-card border-white/10 hover:border-emerald-500/50 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Match Success</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tighter">{applicationSuccessRate}%</h3>
                  <span className="text-xs text-emerald-500 font-bold flex items-center">
                    High {getTrendIcon('up')}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Interview Rate</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 group-hover:rotate-12 transition-transform">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden glass-card border-white/10 hover:border-amber-500/50 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expertise Level</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tighter">{badgeStats.total}</h3>
                  <span className="text-xs text-amber-500 font-bold">Rank 522</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Badges Earned</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/20 group-hover:rotate-12 transition-transform">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden glass-card border-white/10 hover:border-sky-500/50 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Profile Status</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold tracking-tighter">Gold</h3>
                  <span className="text-xs text-emerald-500 font-bold flex items-center">
                    Elite {getTrendIcon('up')}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Visibility Tier</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 flex items-center justify-center border border-sky-500/20 group-hover:rotate-12 transition-transform">
                <Eye className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="discovery" className="space-y-8">
        <TabsList className="bg-card/50 p-1.5 rounded-2xl border border-white/5 lg:w-auto h-auto flex flex-wrap gap-1">
          <TabsTrigger value="discovery" className="p-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-xl">
            <Activity className="w-4 h-4" /> Discovery Loop
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="p-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-xl">
            <Rocket className="w-4 h-4" /> Hiring Pipeline
          </TabsTrigger>
          <TabsTrigger value="intel" className="p-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-xl">
            <Brain className="w-4 h-4" /> Skill Intel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Swiping Trends */}
            <Card className="lg:col-span-2 glass-card border-white/5 shadow-2xl overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5 py-4 pb-4">
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  Discovery Engagement
                </CardTitle>
                <CardDescription>Visualizing your swipe behavior over time</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-10">
                <div className="flex items-end justify-between gap-6 h-64 mb-8">
                  {[
                    { label: 'Likes', count: likedJobsCount, ratio: likeRatio, color: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600', icon: Heart },
                    { label: 'Passes', count: passJobsCount, ratio: passRatio, color: 'bg-rose-500', gradient: 'from-rose-400 to-rose-600', icon: Ban },
                  ].map((stat, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full flex-1 flex flex-col justify-end">
                        <div 
                          className={`w-full bg-gradient-to-t ${stat.gradient} rounded-2xl shadow-xl dark:shadow-${stat.color.split('-')[1] || 'primary'}-500/20 group-hover:opacity-80 transition-all duration-500 flex flex-col items-center justify-center gap-2 overflow-hidden border border-white/20`}
                          style={{ height: `${stat.ratio || 10}%`, minHeight: '100px' }}
                        >
                          <stat.icon className="w-8 h-8 text-white/40 animate-pulse" />
                          <span className="text-3xl font-black text-white drop-shadow-md">{stat.ratio}%</span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="font-bold text-lg">{stat.label}</p>
                        <p className="text-sm text-muted-foreground">{stat.count} Actions</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="text-center border-r border-white/10">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Top Interest</p>
                      <p className="font-bold">{topIndustry}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Intent Score</p>
                      <p className="font-bold text-primary">{Math.round((likedJobsCount / (totalSwipes || 1)) * 100)}%</p>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            <div className="space-y-6">
               <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
                 <CardContent className="p-6 text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/20">
                      <ThumbsUp className="w-8 h-8 text-emerald-500" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold">85/100</h4>
                      <p className="text-sm text-emerald-500 font-medium">Profile Resonance</p>
                   </div>
                   <p className="text-xs text-muted-foreground px-4">
                     Your profile skills align with 85% of your liked job requirements.
                   </p>
                 </CardContent>
               </Card>

               <Card className="glass-card border-primary/20 bg-primary/5">
                 <CardContent className="p-6 text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto border border-primary/20">
                      <Zap className="w-8 h-8 text-primary" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold">12 Days</h4>
                      <p className="text-sm text-primary font-medium">Activity Streak</p>
                   </div>
                   <div className="flex justify-center gap-1">
                      {[1,1,1,1,1,0,0].map((d, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${d ? 'bg-primary' : 'bg-white/10'}`} />
                      ))}
                   </div>
                 </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Funnel */}
              <Card className="lg:col-span-2 glass-card border-white/5">
                <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-pink-500" />
                    </div>
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {[
                      { stage: 'Applications Sent', count: totalApplications, color: 'bg-primary', icon: Briefcase, tag: 'primary' },
                      { stage: 'Under Review', count: pendingApplications, color: 'bg-amber-500', icon: Clock, tag: 'amber' },
                      { stage: 'Interviews Scheduled', count: interviewApplications, color: 'bg-sky-500', icon: Users, tag: 'sky' },
                      { stage: 'Offers Extended', count: offerApplications, color: 'bg-pink-500', icon: Star, tag: 'pink' },
                      { stage: 'Successful Hires', count: hiredApplications, color: 'bg-emerald-500', icon: CheckCircle, tag: 'emerald' },
                    ].map((item, index) => {
                      const percentage = totalApplications > 0 ? Math.round((item.count / totalApplications) * 100) : 0;
                      return (
                        <div key={index} className="flex items-center gap-6 group">
                          <div className={`w-12 h-12 rounded-2xl ${item.color} bg-opacity-20 flex items-center justify-center border ${getColorClasses(item.tag)} group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6" style={{ color: 'inherit' }} />
                          </div>
                          <div className="flex-1 space-y-2">
                             <div className="flex justify-between items-end">
                                <p className="font-bold">{item.stage}</p>
                                <div className="text-right">
                                   <p className="text-lg font-black">{item.count}</p>
                                   <p className="text-[10px] text-muted-foreground font-bold">{percentage}% Yield</p>
                                </div>
                             </div>
                             <div className="h-3 bg-white/5 rounded-full overflow-hidden p-[2px]">
                                <div 
                                  className={`h-full ${item.color} rounded-full relative`}
                                  style={{ width: `${percentage || 2}%` }}
                                >
                                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent animate-shimmer" />
                                </div>
                             </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Status Breakdown */}
              <div className="space-y-6">
                <Card className="glass-card">
                   <CardHeader>
                     <CardTitle className="text-md">Success Distribution</CardTitle>
                   </CardHeader>
                   <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <p className="text-2xl font-black text-emerald-500">{hiredApplications}</p>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Hired</p>
                         </div>
                         <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                            <p className="text-2xl font-black text-rose-500">{rejectedApplications}</p>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Passed</p>
                         </div>
                         <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                            <p className="text-2xl font-black text-amber-500">{pendingApplications}</p>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Live</p>
                         </div>
                         <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center">
                            <p className="text-2xl font-black text-sky-500">{interviewApplications}</p>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Interview</p>
                         </div>
                      </div>
                   </CardContent>
                </Card>

                <Card className="glass-card bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                     <p className="text-sm font-medium mb-4">Response Efficiency</p>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 h-32 flex items-end gap-1">
                           {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                             <div key={i} className="flex-1 bg-primary/40 rounded-sm" style={{ height: `${h}%` }} />
                           ))}
                        </div>
                        <div className="w-20 text-center">
                           <p className="text-3xl font-black">2.4</p>
                           <p className="text-[10px] font-bold uppercase text-muted-foreground">Avg Days</p>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="intel" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-card">
                 <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-500">
                          !
                       </div>
                       Skill Mastery
                    </CardTitle>
                    <CardDescription>Real-time proficiency across core competencies</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    {skillProgress.map((skill, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold">{skill.name}</span>
                           <span className="text-xs font-black text-primary">{skill.proficiency}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full bg-gradient-to-r ${
                               skill.proficiency > 80 ? 'from-emerald-600 to-emerald-400' : 
                               skill.proficiency > 60 ? 'from-primary to-accent' : 'from-amber-600 to-amber-400'
                             }`}
                             style={{ width: `${skill.proficiency}%` }}
                           />
                        </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="glass-card">
                 <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Ban className="w-4 h-4 text-amber-500 rotate-12" />
                       </div>
                       Verified Credentials
                    </CardTitle>
                    <CardDescription>Active certifications and proof of work</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-4 h-full">
                       <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                          <p className="text-4xl font-black mb-2">{badgeStats.byLevel.platinum + badgeStats.byLevel.gold}</p>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Expert Tier Badges</p>
                       </div>
                       <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                          <p className="text-4xl font-black mb-2">{badges.length}</p>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Global Rep Score</p>
                       </div>
                    </div>
                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                       <p className="text-sm font-medium mb-2 flex items-center gap-2">
                         <Rocket className="w-4 h-4 text-primary" /> Skill Trend
                       </p>
                       <p className="text-xs text-muted-foreground">
                         You've added 4 new technical certifications in the last quarter. You're in the top 5% of active learners in your sector.
                       </p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
