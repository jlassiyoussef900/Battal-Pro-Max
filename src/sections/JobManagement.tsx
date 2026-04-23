import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Briefcase,
  TrendingUp,
  Trash2,
  Copy,
  Archive,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Job } from '@/types';

const jobTemplates = [
  { id: '1', title: 'Software Engineer', category: 'Engineering' },
  { id: '2', title: 'Product Manager', category: 'Product' },
  { id: '3', title: 'UX Designer', category: 'Design' },
  { id: '4', title: 'Data Scientist', category: 'Data' },
  { id: '5', title: 'Marketing Manager', category: 'Marketing' },
];

export function JobManagement() {
  const { jobs, companies, applications, setJobs } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: { city: '', remote: false, hybrid: false },
    type: 'full-time',
    experienceLevel: 'mid',
    salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
    skills: [''],
    industry: 'Technology',
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' || job.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const getJobApplications = (jobId: string) => applications.filter(a => a.jobId === jobId);

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const handleAddRequirement = () => {
    setNewJob({ ...newJob, requirements: [...newJob.requirements, ''] });
  };

  const handleAddResponsibility = () => {
    setNewJob({ ...newJob, responsibilities: [...newJob.responsibilities, ''] });
  };

  const handleAddSkill = () => {
    setNewJob({ ...newJob, skills: [...newJob.skills, ''] });
  };

  // Open edit dialog with job data
  const handleEditClick = (job: Job) => {
    setSelectedJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      requirements: job.requirements.length > 0 ? job.requirements : [''],
      responsibilities: job.responsibilities.length > 0 ? job.responsibilities : [''],
      location: { 
        city: job.location.city || '', 
        remote: job.location.remote || false, 
        hybrid: job.location.hybrid || false 
      },
      type: job.type,
      experienceLevel: job.experienceLevel,
      salary: { 
        min: job.salary?.min?.toString() || '', 
        max: job.salary?.max?.toString() || '', 
        currency: job.salary?.currency || 'USD', 
        period: job.salary?.period || 'yearly' 
      },
      skills: job.skills.length > 0 ? job.skills : [''],
      industry: job.industry || 'Technology',
    });
    setShowEditDialog(true);
  };

  // Save edited job
  const handleSaveEdit = () => {
    if (!selectedJob) return;

    const updatedJob: Job = {
      ...selectedJob,
      title: newJob.title,
      description: newJob.description,
      requirements: newJob.requirements.filter(r => r.trim() !== ''),
      responsibilities: newJob.responsibilities.filter(r => r.trim() !== ''),
      location: {
        ...selectedJob.location,
        city: newJob.location.city,
        remote: newJob.location.remote,
        hybrid: newJob.location.hybrid,
      },
      type: newJob.type as Job['type'],
      experienceLevel: newJob.experienceLevel as Job['experienceLevel'],
      salary: newJob.salary.min ? {
        min: parseInt(newJob.salary.min),
        max: parseInt(newJob.salary.max) || parseInt(newJob.salary.min),
        currency: newJob.salary.currency,
        period: newJob.salary.period as 'hourly' | 'monthly' | 'yearly',
      } : undefined,
      skills: newJob.skills.filter(s => s.trim() !== ''),
      industry: newJob.industry,
    };

    // Update jobs in parent state
    const updatedJobs = jobs.map(j => j.id === selectedJob.id ? updatedJob : j);
    (setJobs as any)(updatedJobs);

    setShowEditDialog(false);
    setSelectedJob(null);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (job: Job) => {
    setSelectedJob(job);
    setShowDeleteDialog(true);
  };

  // Confirm delete job
  const handleConfirmDelete = () => {
    if (!selectedJob) return;

    // Remove job from the list
    const updatedJobs = jobs.filter(j => j.id !== selectedJob.id);
    (setJobs as any)(updatedJobs);

    setShowDeleteDialog(false);
    setSelectedJob(null);
  };

  // Reset new job form
  const resetNewJobForm = () => {
    setNewJob({
      title: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      location: { city: '', remote: false, hybrid: false },
      type: 'full-time',
      experienceLevel: 'mid',
      salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
      skills: [''],
      industry: 'Technology',
    });
  };

  // Render job form (shared between create and edit)
  const renderJobForm = (isEdit: boolean = false) => (
    <div className="space-y-6">
      {/* Template Selection (only for create) */}
      {!isEdit && (
        <div>
          <Label>Start from Template (Optional)</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {jobTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title} ({template.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Job Title *</Label>
          <Input
            placeholder="e.g., Senior Software Engineer"
            value={newJob.title}
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Select
            value={newJob.industry}
            onValueChange={(value) => setNewJob({ ...newJob, industry: value })}
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Job Description *</Label>
        <Textarea
          placeholder="Describe the role, responsibilities, and what makes it exciting..."
          rows={4}
          value={newJob.description}
          onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
        />
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select
            value={newJob.type}
            onValueChange={(value) => setNewJob({ ...newJob, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select
            value={newJob.experienceLevel}
            onValueChange={(value) => setNewJob({ ...newJob, experienceLevel: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="City, State"
            value={newJob.location.city}
            onChange={(e) => setNewJob({ ...newJob, location: { ...newJob.location, city: e.target.value } })}
          />
        </div>
      </div>

      {/* Work Arrangement */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={newJob.location.remote}
            onCheckedChange={(checked) => setNewJob({ ...newJob, location: { ...newJob.location, remote: checked } })}
          />
          <Label>Remote Available</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={newJob.location.hybrid}
            onCheckedChange={(checked) => setNewJob({ ...newJob, location: { ...newJob.location, hybrid: checked } })}
          />
          <Label>Hybrid Option</Label>
        </div>
      </div>

      {/* Salary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Min Salary</Label>
          <Input
            type="number"
            placeholder="80000"
            value={newJob.salary.min}
            onChange={(e) => setNewJob({ ...newJob, salary: { ...newJob.salary, min: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Salary</Label>
          <Input
            type="number"
            placeholder="120000"
            value={newJob.salary.max}
            onChange={(e) => setNewJob({ ...newJob, salary: { ...newJob.salary, max: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <Label>Period</Label>
          <Select
            value={newJob.salary.period}
            onValueChange={(value) => setNewJob({ ...newJob, salary: { ...newJob.salary, period: value } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-3">
        <Label>Requirements</Label>
        {newJob.requirements.map((req, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder={`Requirement ${i + 1}`}
              value={req}
              onChange={(e) => {
                const reqs = [...newJob.requirements];
                reqs[i] = e.target.value;
                setNewJob({ ...newJob, requirements: reqs });
              }}
            />
            {i === newJob.requirements.length - 1 && (
              <Button variant="outline" size="icon" onClick={handleAddRequirement}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Responsibilities */}
      <div className="space-y-3">
        <Label>Responsibilities</Label>
        {newJob.responsibilities.map((resp, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder={`Responsibility ${i + 1}`}
              value={resp}
              onChange={(e) => {
                const resps = [...newJob.responsibilities];
                resps[i] = e.target.value;
                setNewJob({ ...newJob, responsibilities: resps });
              }}
            />
            {i === newJob.responsibilities.length - 1 && (
              <Button variant="outline" size="icon" onClick={handleAddResponsibility}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <Label>Required Skills</Label>
        <div className="flex flex-wrap gap-2">
          {newJob.skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                placeholder="Skill"
                value={skill}
                onChange={(e) => {
                  const skills = [...newJob.skills];
                  skills[i] = e.target.value;
                  setNewJob({ ...newJob, skills });
                }}
                className="w-32"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddSkill}>
            <Plus className="w-4 h-4 mr-1" />
            Add Skill
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Job Management</h2>
          <p className="text-muted-foreground">Create and manage your job postings</p>
        </div>
        <Button onClick={() => { resetNewJobForm(); setShowCreateDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* Jobs Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({jobs.filter(j => j.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({jobs.filter(j => j.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({jobs.filter(j => j.status === 'expired').length})</TabsTrigger>
          <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const jobApps = getJobApplications(job.id);
              const company = companies.find(c => c.id === job.companyId);

              return (
                <Card key={job.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-7 h-7 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground mb-3">
                          {company?.name} • Posted {job.postedAt.toLocaleDateString()}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location.remote ? 'Remote' : job.location.city}
                          </Badge>
                          <Badge variant="secondary">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.type.replace('-', ' ')}
                          </Badge>
                          <Badge variant="secondary">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {job.experienceLevel}
                          </Badge>
                          {job.salary && (
                            <Badge variant="secondary">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${(job.salary.min / 1000).toFixed(0)}k - {(job.salary.max / 1000).toFixed(0)}k
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((skill, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            {job.views}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {jobApps.length}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(job)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClick(job)} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Job Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create New Job Posting
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new job posting
            </DialogDescription>
          </DialogHeader>

          {renderJobForm(false)}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Save as Draft
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit Job Posting
            </DialogTitle>
            <DialogDescription>
              Modify the job details below
            </DialogDescription>
          </DialogHeader>

          {renderJobForm(true)}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Job Posting
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="p-4 rounded-lg bg-muted mt-4">
              <p className="font-medium">{selectedJob.title}</p>
              <p className="text-sm text-muted-foreground">
                Posted on {selectedJob.postedAt.toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
