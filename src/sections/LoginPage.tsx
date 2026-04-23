import { type FormEvent, useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Building2, Users, Loader2, Sparkles, CheckCircle, Award, TrendingUp, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { login, register, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState<'jobseeker' | 'company_admin' | 'recruiter'>('jobseeker');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!loginEmail || !loginPassword) {
      setError('Please enter email and password');
      return;
    }

    const { error: loginError } = await login(loginEmail, loginPassword);
    if (loginError) {
      setError(loginError.message);
    } else {
      setSuccess('Signed in successfully!');
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) {
      setError('All fields are required');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { error: registerError } = await register({
      ...registerData,
      role: selectedRole,
    });
    
    if (registerError) {
      setError(registerError.message);
    } else {
      setSuccess('Account created successfully! Welcome to Battal Pro Max!');
      setRegisterData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', dateOfBirth: '' });
      setCompanyName('');
    }
  };

  // Demo login handlers
  const handleDemoLogin = async (role: 'jobseeker' | 'company_admin' | 'recruiter') => {
    setError(null);
    setSuccess(null);
    setLoginEmail('');
    setLoginPassword('');
    
    const demoUsers = {
      jobseeker: { email: 'alex@example.com', password: 'demo' },
      company_admin: { email: 'sarah@example.com', password: 'demo' },
      recruiter: { email: 'mike@example.com', password: 'demo' },
    };

    const user = demoUsers[role];
    const { error: loginError } = await login(user.email, user.password);
    
    if (loginError) {
      setError(loginError.message);
    } else {
      setSuccess(`Demo ${role} logged in successfully!`);
    }
  };

  const features = [
    { icon: Sparkles, text: 'AI-Powered Job Matching', color: 'text-yellow-400' },
    { icon: Award, text: 'Verified Skill Badges', color: 'text-purple-400' },
    { icon: TrendingUp, text: 'Career Growth Tracking', color: 'text-green-400' },
    { icon: CheckCircle, text: 'ATS-Optimized CV Builder', color: 'text-blue-400' },
  ];

  const getRoleColor = useCallback((role: 'jobseeker' | 'company_admin' | 'recruiter') => {
    switch(role) {
      case 'jobseeker': return 'from-blue-500 to-cyan-500';
      case 'company_admin': return 'from-purple-500 to-pink-500';
      case 'recruiter': return 'from-orange-500 to-red-500';
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80')] bg-cover bg-center opacity-20" />
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Battal Pro Max</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Find Your <span className="gradient-text">Dream Job</span> Today
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-md">
              The ultimate platform connecting talented professionals with top companies. 
              Build your CV, earn badges, and land your perfect role.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-3 text-white/80">
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-primary/50 to-accent/50"
                />
              ))}
            </div>
            <div className="text-white/70">
              <span className="text-white font-semibold">10,000+</span> professionals hired
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Battal Pro Max</span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            {/* SIGN IN TAB */}
            <TabsContent value="login">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to access your dashboard and continue your job search
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Social Auth Buttons */}
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or sign in with</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Button variant="outline" type="button" onClick={() => handleDemoLogin('jobseeker')}>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" type="button" onClick={() => handleDemoLogin('jobseeker')}>
                        <svg className="w-4 h-4 mr-2 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SIGN UP TAB */}
            <TabsContent value="register">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Create Your Account</CardTitle>
                  <CardDescription>
                    Join thousands of professionals finding their dream jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                      </Alert>
                    )}

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label>I'm a...</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={selectedRole === 'jobseeker' ? 'default' : 'outline'}
                          className={`flex flex-col items-center gap-1 h-auto py-3 ${
                            selectedRole === 'jobseeker' 
                              ? `bg-gradient-to-r ${getRoleColor('jobseeker')} border-0` 
                              : ''
                          }`}
                          onClick={() => setSelectedRole('jobseeker')}
                        >
                          <Briefcase className="w-4 h-4" />
                          <span className="text-xs">Job Seeker</span>
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRole === 'company_admin' ? 'default' : 'outline'}
                          className={`flex flex-col items-center gap-1 h-auto py-3 ${
                            selectedRole === 'company_admin' 
                              ? `bg-gradient-to-r ${getRoleColor('company_admin')} border-0` 
                              : ''
                          }`}
                          onClick={() => setSelectedRole('company_admin')}
                        >
                          <Building2 className="w-4 h-4" />
                          <span className="text-xs">Company</span>
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRole === 'recruiter' ? 'default' : 'outline'}
                          className={`flex flex-col items-center gap-1 h-auto py-3 ${
                            selectedRole === 'recruiter' 
                              ? `bg-gradient-to-r ${getRoleColor('recruiter')} border-0` 
                              : ''
                          }`}
                          onClick={() => setSelectedRole('recruiter')}
                        >
                          <Users className="w-4 h-4" />
                          <span className="text-xs">Recruiter</span>
                        </Button>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Date of Birth and Email Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={registerData.dateOfBirth}
                          onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regEmail">Email Address</Label>
                        <Input
                          id="regEmail"
                          type="email"
                          placeholder="you@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2 relative">
                      <Label htmlFor="regPassword">Password</Label>
                      <div className="relative">
                        <Input
                          id="regPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        {registerData.password && registerData.confirmPassword && registerData.password === registerData.confirmPassword && (
                          <span className="text-xs text-green-500 font-medium flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                            <CheckCircle className="w-3 h-3" /> Matched
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Company Name (only for company_admin) */}
                    {selectedRole === 'company_admin' && (
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="Your Company Inc."
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    {/* Social Auth Buttons */}
                    <div className="mt-6 flex flex-col gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button variant="outline" type="button" onClick={() => handleDemoLogin('jobseeker')}>
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Google
                        </Button>
                        <Button variant="outline" type="button" onClick={() => handleDemoLogin('jobseeker')}>
                          <svg className="w-4 h-4 mr-2 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}