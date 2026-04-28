import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/hooks/useMockData';
import { getProfile, getUserSkills, getUserExperience, getUserEducation } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Sparkles,
  Palette,
  Layout,
  Type,
  Monitor,
} from 'lucide-react';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001';

const templates = [
  { id: 'professional', name: 'Professional', preview: 'professional', color: 'from-slate-600 via-slate-700 to-slate-900', icon: Type },
  { id: 'modern', name: 'Modern', preview: 'modern', color: 'from-indigo-500 via-purple-500 to-pink-500', icon: Monitor },
  { id: 'minimal', name: 'Minimal', preview: 'minimal', color: 'from-emerald-400 via-teal-500 to-cyan-600', icon: Layout },
];

export function CVGenerator() {
  const { user } = useAuth();
  const { profile, badges, cvTemplates } = useMockData();
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [jobTitle, setJobTitle] = useState('');

  // Load user data
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    const [profileRes, skillsRes, expRes, eduRes] = await Promise.all([
      getProfile(user.id),
      getUserSkills(user.id),
      getUserExperience(user.id),
      getUserEducation(user.id)
    ]);

    if (profileRes.data) setProfileData(profileRes.data);
    if (skillsRes.data) setSkills(skillsRes.data);
    if (expRes.data) setExperience(expRes.data);
    if (eduRes.data) setEducation(eduRes.data);
  };

  const buildCV = () => {
    const firstName = user?.firstName || profile.headline?.split(' ')[0] || 'Your';
    const lastName = user?.lastName || profile.headline?.split(' ')[1] || 'Name';
    const email = user?.email || 'your@email.com';
    const allSkills = skills.length > 0 ? skills : profile.skills;
    const allExperience = experience.length > 0 ? experience : profile.workExperience;
    const allEducation = education.length > 0 ? education : profile.education;
    const headline = profileData?.headline || profile.headline || '';
    const summary = profileData?.summary || profile.summary || '';
    const phone = profileData?.phone || profile.phone || '';
    const linkedin = profileData?.linkedin || profile.linkedIn || '';
    const portfolio = profileData?.portfolio || profile.portfolio || '';
    const city = profileData?.city || profile.location?.city || '';
    const region = profileData?.region || profile.location?.region || '';

    const colors = {
      professional: { primary: '#1e293b', accent: '#3b82f6', light: '#f1f5f9' },
      modern: { primary: '#6366f1', accent: '#8b5cf6', light: '#f5f3ff' },
      minimal: { primary: '#0f766e', accent: '#14b8a6', light: '#f0fdfa' },
    };
    const c = colors[selectedTemplate as keyof typeof colors] || colors.professional;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; font-size: 13px; line-height: 1.5; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { border-bottom: 3px solid ${c.primary}; padding-bottom: 20px; margin-bottom: 24px; }
  .name { font-size: 28px; font-weight: 700; color: ${c.primary}; }
  .headline { font-size: 15px; color: ${c.accent}; margin-top: 4px; font-weight: 500; }
  .contact { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 12px; color: #475569; }
  .contact span { display: flex; align-items: center; gap: 4px; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${c.primary}; border-bottom: 1px solid ${c.light}; padding-bottom: 6px; margin-bottom: 12px; }
  .exp-item, .edu-item { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .exp-title { font-weight: 600; font-size: 14px; }
  .exp-company { color: #475569; font-size: 13px; }
  .exp-date { font-size: 12px; color: #94a3b8; white-space: nowrap; }
  .exp-desc { margin-top: 6px; color: #475569; font-size: 12px; }
  .achievements { margin-top: 6px; padding-left: 16px; }
  .achievements li { font-size: 12px; color: #475569; margin-bottom: 3px; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { background: ${c.light}; color: ${c.primary}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  .badge-tag { background: ${c.accent}; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
  .summary { color: #475569; font-size: 13px; line-height: 1.7; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="name">${firstName} ${lastName}</div>
    ${headline ? `<div class="headline">${headline}</div>` : ''}
    <div class="contact">
      ${email ? `<span>✉ ${email}</span>` : ''}
      ${phone ? `<span>📞 ${phone}</span>` : ''}
      ${city || region ? `<span>📍 ${[city, region].filter(Boolean).join(', ')}</span>` : ''}
      ${linkedin ? `<span>🔗 ${linkedin}</span>` : ''}
      ${portfolio ? `<span>🌐 ${portfolio}</span>` : ''}
    </div>
  </div>

  ${summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p class="summary">${summary}</p>
  </div>` : ''}

  ${allExperience.length > 0 ? `
  <div class="section">
    <div class="section-title">Work Experience</div>
    ${allExperience.map((exp: any) => {
      const start = exp.startDate ? new Date(exp.startDate).getFullYear() : exp.start_date?.slice(0, 4) || '';
      const end = exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : exp.end_date?.slice(0, 4) || '');
      const desc = exp.description || '';
      const achievements = exp.achievements || [];
      return `
      <div class="exp-item">
        <div class="exp-header">
          <div>
            <div class="exp-title">${exp.position || exp.title || ''}</div>
            <div class="exp-company">${exp.company || ''} ${exp.location ? '• ' + exp.location : ''}</div>
          </div>
          <div class="exp-date">${start}${end ? ' – ' + end : ''}</div>
        </div>
        ${desc ? `<div class="exp-desc">${desc}</div>` : ''}
        ${achievements.length > 0 ? `<ul class="achievements">${achievements.map((a: string) => `<li>${a}</li>`).join('')}</ul>` : ''}
      </div>`;
    }).join('')}
  </div>` : ''}

  ${allEducation.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${allEducation.map((edu: any) => {
      const start = edu.startDate ? new Date(edu.startDate).getFullYear() : edu.start_date?.slice(0, 4) || '';
      const end = edu.current ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : edu.end_date?.slice(0, 4) || '');
      return `
      <div class="edu-item">
        <div class="exp-header">
          <div>
            <div class="exp-title">${edu.degree || ''} ${edu.fieldOfStudy || edu.field_of_study ? 'in ' + (edu.fieldOfStudy || edu.field_of_study) : ''}</div>
            <div class="exp-company">${edu.institution || ''}</div>
          </div>
          <div class="exp-date">${start}${end ? ' – ' + end : ''}</div>
        </div>
        ${edu.gpa ? `<div class="exp-desc">GPA: ${edu.gpa}</div>` : ''}
      </div>`;
    }).join('')}
  </div>` : ''}

  ${allSkills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${allSkills.map((s: any) => `<span class="skill-tag">${s.name || s}</span>`).join('')}
    </div>
  </div>` : ''}

  ${badges.length > 0 ? `
  <div class="section">
    <div class="section-title">Verified Badges</div>
    <div class="skills-grid">
      ${badges.map((b: any) => `<span class="badge-tag">${b.name} (${b.level})</span>`).join('')}
    </div>
  </div>` : ''}
</div>
</body>
</html>`;
  };

  const handleGenerateCV = () => {
    if (!user) return;
    setLoading(true);
    setTimeout(() => {
      const cv = buildCV();
      setGeneratedCV(cv);
      setShowPreview(true);
      setLoading(false);
    }, 600);
  };

  const handleDownloadPDF = () => {
    const cv = generatedCV || buildCV();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(cv);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-700';
      case 'silver': return 'bg-gradient-to-r from-slate-400 to-slate-500';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-amber-500';
      case 'platinum': return 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500';
      default: return 'bg-muted';
    }
  };

  const renderCVPreview = () => (
    <div className="bg-white text-slate-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{profile.workExperience[0]?.position || 'Professional'}</h1>
        <p className="text-lg text-slate-600 mt-1">{profile.headline}</p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {profile.location.city}, {profile.location.region}
            </span>
          )}
          {profile.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {profile.phone}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            alex.johnson@email.com
          </span>
          {profile.linkedIn && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-4 h-4" />
              {profile.linkedIn}
            </span>
          )}
          {profile.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {profile.portfolio}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{profile.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
          Work Experience
        </h2>
        <div className="space-y-4">
          {profile.workExperience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                  <p className="text-slate-600">{exp.company} • {exp.location}</p>
                </div>
                <span className="text-sm text-slate-500">
                  {exp.startDate.getFullYear()} - {exp.current ? 'Present' : exp.endDate?.getFullYear()}
                </span>
              </div>
              <p className="text-slate-700 mt-2 text-sm">{exp.description}</p>
              {exp.achievements.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-slate-400 mt-1">•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
          Education
        </h2>
        <div className="space-y-4">
          {profile.education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h3>
                  <p className="text-slate-600">{edu.institution}</p>
                </div>
                <span className="text-sm text-slate-500">
                  {edu.startDate.getFullYear()} - {edu.current ? 'Present' : edu.endDate?.getFullYear()}
                </span>
              </div>
              {edu.gpa && <p className="text-sm text-slate-600 mt-1">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span key={skill.id} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
              {skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      {profile.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
            Certifications
          </h2>
          <div className="space-y-2">
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className="font-medium text-slate-900">{cert.name}</span>
                <span className="text-sm text-slate-500">{cert.issuer} • {cert.issueDate.getFullYear()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
            Verified Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge.id} className={`px-3 py-1 text-white rounded-full text-sm ${getBadgeClass(badge.level)}`}>
                {badge.name} ({badge.level})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CV Generator</h2>
          <p className="text-muted-foreground">Create professional, AI-powered resumes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateCV} disabled={loading}>
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Generate with AI'}
          </Button>
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => { if (!generatedCV) setGeneratedCV(buildCV()); }}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>CV Preview</DialogTitle>
              </DialogHeader>
              {generatedCV ? (
                <div dangerouslySetInnerHTML={{ __html: generatedCV }} />
              ) : (
                renderCVPreview()
              )}
            </DialogContent>
          </Dialog>
          <Button onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 p-1.5 rounded-2xl border border-indigo-100/50 dark:border-white/5 lg:w-auto h-auto flex flex-wrap gap-1">
          <TabsTrigger value="templates" className="p-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-xl">
            <Layout className="w-4 h-4" /> Design
          </TabsTrigger>
          <TabsTrigger value="content" className="p-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-xl">
            <FileText className="w-4 h-4" /> Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="p-3 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-xl">
            <Palette className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-500 glass-card relative overflow-hidden group ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary border-primary shadow-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${template.color} opacity-5 group-hover:opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity`} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}>
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          {selectedTemplate === template.id && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Professional design optimized for {template.id === 'modern' ? 'tech' : template.id === 'classic' ? 'traditional' : 'modern'} industries
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {template.id}
                          </Badge>
                          <Badge variant="outline" className="text-xs">ATS Friendly</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Powered Suggestions
              </CardTitle>
              <CardDescription>
                Our AI analyzes your profile to suggest improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Add quantifiable achievements to your work experience',
                  'Include 2-3 more technical skills for better ATS matching',
                  'Your summary could be more impactful with action verbs',
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.workExperience.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-lg border border-border/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exp.position}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <Badge variant="outline">
                          {exp.current ? 'Current' : 'Past'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="p-4 rounded-lg border border-border/50">
                      <p className="font-medium">{edu.degree} in {edu.fieldOfStudy}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <Badge key={badge.id} className={`${getBadgeClass(badge.level)} text-white`}>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>Configure how your CV will be exported</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">Include Contact Information</p>
                  <p className="text-sm text-muted-foreground">Phone, email, and address</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">Include Badges</p>
                  <p className="text-sm text-muted-foreground">Show verified skill badges</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">ATS Optimization</p>
                  <p className="text-sm text-muted-foreground">Optimize for applicant tracking systems</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
