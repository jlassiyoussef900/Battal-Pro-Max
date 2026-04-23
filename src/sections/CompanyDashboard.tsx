import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  Bell,
  TrendingUp,
  Eye,
  UserCheck,
  Clock,
  DollarSign,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Building2,
} from 'lucide-react';
import { JobManagement } from './JobManagement';
import { SkillTesting } from './SkillTesting';
import { CandidateTracking } from './CandidateTracking';
import { CompanySettings } from './CompanySettings';

export function CompanyDashboard() {
  const { user } = useAuth();
  const { dashboardMetrics, analyticsData, notifications, jobs, applications } = useMockData();
  const [activeSection, setActiveSection] = useState('overview');
  const [companyView, setCompanyView] = useState<'admin' | 'recruiter'>('admin');

  const unreadNotifications = notifications.filter(n => !n.read && n.userId === user?.id);

  // Calculate conversion rates
  const viewToApplyRate = Math.round((dashboardMetrics.applications / dashboardMetrics.totalViews) * 100);
  const applyToInterviewRate = Math.round((dashboardMetrics.interviews / dashboardMetrics.applications) * 100);
  const interviewToHireRate = Math.round((dashboardMetrics.hires / dashboardMetrics.interviews) * 100);

  const renderOverview = () => (
    <div className="space-y-6 animate-slide-up">
      {/* View Switcher */}
      <div className="flex gap-2 mb-2">
        <Button
          size="sm"
          variant={companyView === 'admin' ? 'default' : 'outline'}
          onClick={() => setCompanyView('admin')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Company Admin
        </Button>
        <Button
          size="sm"
          variant={companyView === 'recruiter' ? 'default' : 'outline'}
          onClick={() => setCompanyView('recruiter')}
        >
          <Users className="w-4 h-4 mr-2" />
          Recruiter
        </Button>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.firstName}</span>! 👋
          </h1>
          <p className="text-muted-foreground max-w-lg">
            {companyView === 'admin'
              ? `You have ${dashboardMetrics.activeJobs} active job postings and ${applications.filter(a => a.status === 'new').length} new applications to review.`
              : `You have ${applications.filter(a => a.status === 'new').length} new candidates to screen and ${applications.filter(a => a.status === 'interview').length} interviews scheduled.`
            }
          </p>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setActiveSection('jobs')}>
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
            <Button variant="outline" onClick={() => setActiveSection('candidates')}>
              <Users className="w-4 h-4 mr-2" />
              Review Candidates
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold">{dashboardMetrics.activeJobs}</p>
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
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold">{dashboardMetrics.totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold">{dashboardMetrics.applications}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time to Hire</p>
                <p className="text-3xl font-bold">{dashboardMetrics.timeToHire}d</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Application Funnel
            </CardTitle>
            <CardDescription>Conversion rates through the hiring pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Views */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Job Views</span>
                  <span className="text-sm text-muted-foreground">{analyticsData.applicationFunnel.views.toLocaleString()}</span>
                </div>
                <Progress value={100} className="h-3" />
              </div>

              {/* Applications */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Applications</span>
                  <span className="text-sm text-muted-foreground">{analyticsData.applicationFunnel.applications} ({viewToApplyRate}%)</span>
                </div>
                <Progress value={viewToApplyRate} className="h-3" />
              </div>

              {/* Interviews */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Interviews</span>
                  <span className="text-sm text-muted-foreground">{analyticsData.applicationFunnel.interviews} ({applyToInterviewRate}%)</span>
                </div>
                <Progress value={applyToInterviewRate} className="h-3" />
              </div>

              {/* Hires */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Hires</span>
                  <span className="text-sm text-muted-foreground">{analyticsData.applicationFunnel.hires} ({interviewToHireRate}%)</span>
                </div>
                <Progress value={interviewToHireRate} className="h-3 bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Candidate Sources
            </CardTitle>
            <CardDescription>Where your applicants are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.candidateSources).map(([source, count], index) => {
                const total = Object.values(analyticsData.candidateSources).reduce((a, b) => a + b, 0);
                const percentage = Math.round((count / total) * 100);
                const colors = ['bg-primary', 'bg-accent', 'bg-green-500', 'bg-orange-500'];
                return (
                  <div key={source}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{source}</span>
                      <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${colors[index]} rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Performing Jobs
            </CardTitle>
            <CardDescription>Jobs with the most views and applications</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveSection('jobs')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topPerformingJobs.map((job, index) => (
              <div key={job.jobId} className="flex items-center gap-4 p-4 rounded-lg border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{job.title}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {job.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      {job.applications} applications
                    </span>
                  </div>
                </div>
                <Badge variant="outline">
                  {Math.round((job.applications / job.views) * 100)}% conversion
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Skill Gap Analysis
          </CardTitle>
          <CardDescription>Most requested skills in your applicant pool</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(analyticsData.skillGapAnalysis).map(([skill, demand]) => (
              <div key={skill} className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-primary">{demand}%</p>
                <p className="text-sm text-muted-foreground">{skill}</p>
                <Progress value={demand} className="h-1 mt-2" />
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
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'jobs', label: 'Job Management', icon: Briefcase },
              { id: 'candidates', label: 'Candidates', icon: Users },
              { id: 'tests', label: 'Skill Testing', icon: FileText },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications.length },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
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
              <p className="text-xs text-muted-foreground capitalize truncate">Company</p>
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
          {activeSection === 'jobs' && <JobManagement />}
          {activeSection === 'candidates' && <CandidateTracking />}
          {activeSection === 'tests' && <SkillTesting />}
          {activeSection === 'notifications' && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Notifications</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 rounded-lg border ${notif.read ? 'border-border/50' : 'border-primary/30 bg-primary/5'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-muted' : 'bg-primary'}`} />
                          <div>
                            <p className="font-medium">{notif.title}</p>
                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notif.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {activeSection === 'settings' && <CompanySettings />}
        </div>
      </main>
    </div>
  );
}
