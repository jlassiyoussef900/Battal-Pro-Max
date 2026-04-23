import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  User,
  Building2,
  Bell,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  RotateCcw,
  Briefcase,
  Users,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Trash2,
  Plus,
  Link,
  Linkedin,
  Twitter,
} from 'lucide-react';

export function CompanySettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
  });

  // Company settings
  const [company, setCompany] = useState({
    name: 'TechCorp Inc.',
    description: 'Leading technology company focused on innovative software solutions.',
    website: 'https://techcorp.com',
    linkedin: 'https://linkedin.com/company/techcorp',
    twitter: '@techcorp',
    industry: 'Technology',
    size: '51-200',
    founded: '2015',
    headquarters: 'San Francisco, CA',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    newApplications: true,
    candidateMessages: true,
    testCompletions: true,
    dailyDigest: true,
    marketingEmails: false,
    teamActivity: true,
  });

  // Privacy & Security settings
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showCompanyInfo: true,
    allowCandidateContact: true,
    twoFactorAuth: false,
    requireApproval: true,
  });

  // Team members
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Sarah Williams', email: 'sarah@techcorp.com', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop' },
    { id: '2', name: 'Mike Chen', email: 'mike@techcorp.com', role: 'Recruiter', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop' },
    { id: '3', name: 'Emily Davis', email: 'emily@techcorp.com', role: 'Hiring Manager', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop' },
  ]);

  const handleProfileChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCompanyChange = (field: string, value: any) => {
    setCompany(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleReset = () => {
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      jobTitle: 'HR Manager',
      department: 'Human Resources',
    });
    setCompany({
      name: 'TechCorp Inc.',
      description: 'Leading technology company focused on innovative software solutions.',
      website: 'https://techcorp.com',
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: '@techcorp',
      industry: 'Technology',
      size: '51-200',
      founded: '2015',
      headquarters: 'San Francisco, CA',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    });
    setHasChanges(false);
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account and company settings</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 lg:w-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Your personal profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) => handleProfileChange('jobTitle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={profile.department}
                    onValueChange={(value) => handleProfileChange('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          {/* Company Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>Your company branding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 rounded-xl">
                    <AvatarImage src={company.logo} className="rounded-xl" />
                    <AvatarFallback className="text-2xl rounded-xl">
                      <Building2 className="w-10 h-10" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Recommended: 400x400px. Max 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Details about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={company.name}
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Description</Label>
                <Textarea
                  id="companyDescription"
                  placeholder="Describe your company..."
                  rows={4}
                  value={company.description}
                  onChange={(e) => handleCompanyChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={company.industry}
                    onValueChange={(value) => handleCompanyChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={company.size}
                    onValueChange={(value) => handleCompanyChange('size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="founded">Year Founded</Label>
                  <Input
                    id="founded"
                    value={company.founded}
                    onChange={(e) => handleCompanyChange('founded', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input
                    id="headquarters"
                    value={company.headquarters}
                    onChange={(e) => handleCompanyChange('headquarters', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Your company's online presence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://yourcompany.com"
                  value={company.website}
                  onChange={(e) => handleCompanyChange('website', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/company/yourcompany"
                  value={company.linkedin}
                  onChange={(e) => handleCompanyChange('linkedin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="@yourcompany"
                  value={company.twitter}
                  onChange={(e) => handleCompanyChange('twitter', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage who can access your company account</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleRemoveTeamMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>People you've invited to join</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending invitations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">New Applications</p>
                    <p className="text-sm text-muted-foreground">When candidates apply to your jobs</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.newApplications}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, newApplications: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Candidate Messages</p>
                    <p className="text-sm text-muted-foreground">Direct messages from candidates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.candidateMessages}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, candidateMessages: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Test Completions</p>
                    <p className="text-sm text-muted-foreground">When candidates complete skill tests</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.testCompletions}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, testCompletions: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Team Activity</p>
                    <p className="text-sm text-muted-foreground">Updates from your team members</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.teamActivity}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, teamActivity: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Tips, news, and promotional content</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, marketingEmails: checked });
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Digest</CardTitle>
              <CardDescription>Summary of daily activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Enable Daily Digest</p>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of applications and activity</p>
                </div>
                <Switch
                  checked={notifications.dailyDigest}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, dailyDigest: checked });
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your visibility and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Public Company Profile</p>
                  <p className="text-sm text-muted-foreground">Allow candidates to find your company profile</p>
                </div>
                <Switch
                  checked={privacy.publicProfile}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, publicProfile: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Show Company Information</p>
                  <p className="text-sm text-muted-foreground">Display company details on job postings</p>
                </div>
                <Switch
                  checked={privacy.showCompanyInfo}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, showCompanyInfo: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Allow Candidate Contact</p>
                  <p className="text-sm text-muted-foreground">Candidates can message you directly</p>
                </div>
                <Switch
                  checked={privacy.allowCandidateContact}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, allowCandidateContact: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Require Approval for Job Posts</p>
                  <p className="text-sm text-muted-foreground">New job postings need admin approval</p>
                </div>
                <Switch
                  checked={privacy.requireApproval}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, requireApproval: checked });
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Protect your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch
                  checked={privacy.twoFactorAuth}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, twoFactorAuth: checked });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current and new password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
              <Button onClick={() => setShowPasswordDialog(false)}>Update Password</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-destructive/10">
              <p className="text-sm text-destructive">
                Warning: This will delete your account, all job postings, test results, and team data.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type "DELETE" to confirm</Label>
              <Input placeholder="DELETE" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
