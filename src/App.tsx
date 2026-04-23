import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/sections/LoginPage';
import { JobSeekerDashboard } from '@/sections/JobSeekerDashboard';
import { CompanyDashboard } from '@/sections/CompanyDashboard';
import { OnboardingQuiz } from '@/sections/OnboardingQuiz';
import { TutorialOverlay } from '@/sections/TutorialOverlay';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, User } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useMockDataInternal, MockDataContext } from '@/hooks/useMockData';

function RoleSwitcher() {
  const { user, switchRole, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <ThemeToggle />
      <div className="relative">
        <Button
          variant="outline"
          className="glass-effect border-white/20 gap-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          <User className="w-4 h-4" />
          <span className="capitalize">{user.role.replace('_', ' ')}</span>
        </Button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl glass-effect border border-white/10 overflow-hidden animate-fade-in shadow-2xl">
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-3 py-2">Switch Role</p>
              <button
                onClick={() => { switchRole('jobseeker'); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  user.role === 'jobseeker' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Job Seeker
              </button>
              <button
                onClick={() => { switchRole('company'); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  user.role === 'company' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Company
              </button>
            </div>
            <div className="border-t border-white/10 p-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false);

  useEffect(() => {
    if (user) {
      setOnboardingDone(!!localStorage.getItem(`onboarding_done_${user.id}`));
      setTutorialDone(!!localStorage.getItem(`tutorial_done_${user.id}`));
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) localStorage.setItem(`onboarding_done_${user.id}`, 'true');
    setOnboardingDone(true);
  };

  const handleTutorialComplete = () => {
    if (user) localStorage.setItem(`tutorial_done_${user.id}`, 'true');
    setTutorialDone(true);
  };

  if (!isAuthenticated) return <LoginPage />;
  if (!onboardingDone) return <OnboardingQuiz onComplete={handleOnboardingComplete} />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-500">
      {/* Decorative Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 dark:bg-accent/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <RoleSwitcher />
        {user?.role === 'jobseeker' ? <JobSeekerDashboard /> : <CompanyDashboard />}
        {!tutorialDone && <TutorialOverlay onComplete={handleTutorialComplete} />}
      </div>
    </div>
  );
}

function MockDataProvider({ children }: { children: React.ReactNode }) {
  // Ensure we are using the internal hook correctly
  const data = useMockDataInternal();
  return <MockDataContext.Provider value={data}>{children}</MockDataContext.Provider>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="jobmatch-theme" themes={['dark', 'light', 'day']}>
      <MockDataProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </MockDataProvider>
    </ThemeProvider>
  );
}
