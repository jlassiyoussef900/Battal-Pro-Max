import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase,
  FileText,
  Award,
  Bell,
  Settings as SettingsIcon,
  TrendingUp,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Star,
  CheckCircle,
  Code,
  MessageCircle,
  Languages,
  Brain,
  ChevronRight,
  Filter,
  Search,
  Download,
  Eye,
  Play,
  Trophy,
  BarChart3,
  Heart,
  Sparkles,
} from 'lucide-react';
import { LikedJobs } from './LikedJobs';
import { CVGenerator } from './CVGenerator';
import { JobMatcher } from './JobMatcher';
import { QuizSystem } from './QuizSystem';
import { Settings } from './Settings';
import { Statistics } from './Statistics';

export function JobSeekerDashboard() {
  const { user } = useAuth();
  const { profile, badges, notifications, applications, getJobMatches, companies: mockCompanies, refresh, markNotificationAsRead } = useData();
  const [activeSection, setActiveSection] = useState('overview');
  const matches = getJobMatches();

  // Fetch data when component mounts
  useEffect(() => {
    refresh.jobs();
    refresh.companies();
    refresh.applications();
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'code': return <Code className="w-4 h-4" />;
      case 'atom': return <Star className="w-4 h-4" />;
      case 'message-circle': return <MessageCircle className="w-4 h-4" />;
      case 'languages': return <Languages className="w-4 h-4" />;
      case 'brain': return <Brain className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
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

  const renderOverview = () => (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-indigo-50/30 to-background border border-indigo-100/50 p-10 shadow-xl shadow-indigo-500/5 transition-all duration-500 dark:from-primary/20 dark:via-accent/10 dark:to-background dark:border-primary/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Optimized Profile
          </Badge>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Welcome back, <span className="gradient-text">{user?.firstName}</span>! 👋
          </h1>
          <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
            You have <span className="text-foreground font-semibold">{applications.length}</span> active applications and <span className="text-foreground font-semibold">{matches.filter(m => m.compatibilityScore > 80).length}</span> high-match jobs waiting for you.
          </p>
          <div className="flex gap-4 mt-8">
            <Button size="lg" onClick={() => setActiveSection('jobs')} className="rounded-xl shadow-lg shadow-primary/20 px-8 transition-transform hover:scale-105 active:scale-95">
              <Search className="w-5 h-5 mr-2" />
              Find Jobs
            </Button>
            <Button size="lg" variant="outline" onClick={() => setActiveSection('cv')} className="rounded-xl glass-effect border-indigo-200/50 px-8 transition-transform hover:scale-105 active:scale-95">
              <FileText className="w-5 h-5 mr-2" />
              Update CV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold">{applications.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-3xl font-bold">{badges.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-3xl font-bold">127</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Match Score</p>
                <p className="text-3xl font-bold">87%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to increase visibility to employers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-bold text-primary">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { label: 'Personal Info', complete: true },
                  { label: 'Work Experience', complete: true },
                  { label: 'Education', complete: true },
                  { label: 'Skills', complete: true },
                  { label: 'Certifications', complete: true },
                  { label: 'Portfolio', complete: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      item.complete ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.complete ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <span className={`text-sm ${item.complete ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
            <CardDescription>Your latest achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 rounded-lg ${getBadgeClass(badge.level)} flex items-center justify-center text-white`}>
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{badge.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{badge.level} • {badge.score}%</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => setActiveSection('badges')}>
              View All Badges
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Job Matches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Job Matches</CardTitle>
            <CardDescription>Jobs that best match your skills and preferences</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setActiveSection('jobs')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.slice(0, 3).map((match) => (
              <div key={match.job.id} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{match.job.title}</h4>
                    <Badge variant={match.compatibilityScore >= 80 ? 'default' : 'secondary'}>
                      {match.compatibilityScore}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {mockCompanies.find(c => c.id === match.job.companyId)?.name} • {match.job.location.city || 'Remote'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.job.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <Button size="sm">Apply</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Battal Pro</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'jobs', label: 'Discover Jobs', icon: Search, tutorial: 'nav-jobs' },
              { id: 'liked', label: 'Liked Jobs', icon: Heart, tutorial: 'nav-liked' },
              { id: 'statistics', label: 'Statistics', icon: BarChart3, tutorial: 'nav-statistics' },
              { id: 'cv', label: 'CV Generator', icon: FileText, tutorial: 'nav-cv' },
              { id: 'badges', label: 'Quizzes & Badges', icon: Award, tutorial: 'nav-badges' },
              { id: 'applications', label: 'Applications', icon: Briefcase },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications.length },
              { id: 'settings', label: 'Settings', icon: SettingsIcon, tutorial: 'nav-settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                data-tutorial={item.tutorial}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">Battal Pro</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'jobs' && <JobMatcher />}
          {activeSection === 'liked' && <LikedJobs />}
          {activeSection === 'statistics' && <Statistics />}
          {activeSection === 'cv' && <CVGenerator />}
          {activeSection === 'badges' && <QuizSystem />}
          {activeSection === 'applications' && (
            <div className="animate-slide-up space-y-6">
              <div>
                <h2 className="text-2xl font-bold">My Applications</h2>
                <p className="text-muted-foreground">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const job = matches.find(m => m.job.id === app.jobId)?.job;
                    const company = mockCompanies.find(c => c.id === job?.companyId);
                    const appliedDate = app.appliedAt ? new Date(app.appliedAt) : new Date();
                    const statusColors: Record<string, string> = {
                      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      shortlisted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                      testing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                      interview: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                      offer: 'bg-green-500/20 text-green-400 border-green-500/30',
                      hired: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
                    };
                    const statusColor = statusColors[app.status] || 'bg-muted text-muted-foreground';
                    return (
                      <Card key={app.id} className="card-hover">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              {company?.logo ? (
                                <img src={company.logo} alt={company.name} className="w-9 h-9 rounded-lg object-cover" />
                              ) : (
                                <Building2 className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{job?.title || 'Position'}</p>
                              <p className="text-sm text-muted-foreground">
                                {company?.name || 'Company'} • {job?.location?.remote ? 'Remote' : (job?.location?.city || 'Location TBD')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied {appliedDate.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={`capitalize border ${statusColor}`}>{app.status}</Badge>
                              {job?.salary && (
                                <span className="text-xs text-muted-foreground">
                                  ${(job.salary.min / 1000).toFixed(0)}k – ${(job.salary.max / 1000).toFixed(0)}k
                                </span>
                              )}
                            </div>
                          </div>
                          {app.notes && (
                            <p className="mt-3 text-sm text-muted-foreground border-t border-border/50 pt-3">{app.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-6">Start applying to jobs from Discover or Liked Jobs.</p>
                    <Button onClick={() => setActiveSection('jobs')}>
                      <Search className="w-4 h-4 mr-2" />
                      Discover Jobs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {activeSection === 'notifications' && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Notifications</h2>
              {notifications.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${notif.read ? 'border-border/50' : 'border-primary/30 bg-primary/5'}`}
                          onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-muted' : 'bg-primary'}`} />
                            <div className="flex-1">
                              <p className="font-medium">{notif.title}</p>
                              <p className="text-sm text-muted-foreground">{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notif.read && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {activeSection === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
