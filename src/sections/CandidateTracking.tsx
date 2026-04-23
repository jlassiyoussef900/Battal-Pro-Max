import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  Send,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  FileText,
  Download,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';

const stages: { id: ApplicationStatus; label: string; color: string; icon: typeof CheckCircle }[] = [
  { id: 'new', label: 'New', color: 'bg-blue-500', icon: Clock },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-yellow-500', icon: Star },
  { id: 'testing', label: 'Testing', color: 'bg-purple-500', icon: FileText },
  { id: 'interview', label: 'Interview', color: 'bg-orange-500', icon: UserCheck },
  { id: 'offer', label: 'Offer', color: 'bg-pink-500', icon: Mail },
  { id: 'hired', label: 'Hired', color: 'bg-green-500', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500', icon: XCircle },
];

export function CandidateTracking() {
  const { applications, jobs, companies, updateApplicationStatus } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedStage, setSelectedStage] = useState<ApplicationStatus | 'all'>('all');

  const filteredApplications = applications.filter(app => {
    const job = jobs.find(j => j.id === app.jobId);
    const matchesSearch = job?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'all' || app.status === selectedStage;
    return matchesSearch && matchesStage;
  });

  const getStageCount = (stage: ApplicationStatus) => 
    applications.filter(a => a.status === stage).length;

  const getStageColor = (status: ApplicationStatus) => {
    const stage = stages.find(s => s.id === status);
    return stage?.color || 'bg-muted';
  };

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(applicationId, newStatus);
    if (selectedCandidate?.id === applicationId) {
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
    }
  };

  const renderPipeline = () => (
    <div className="space-y-6">
      {/* Pipeline Stages */}
      <div className="flex overflow-x-auto pb-4 gap-2">
        <button
          onClick={() => setSelectedStage('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStage === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({applications.length})
        </button>
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedStage === stage.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <stage.icon className="w-4 h-4" />
            {stage.label} ({getStageCount(stage.id)})
          </button>
        ))}
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplications.map((app) => {
          const job = jobs.find(j => j.id === app.jobId);
          const stage = stages.find(s => s.id === app.status);
          const StageIcon = stage?.icon || Clock;

          return (
            <Card
              key={app.id}
              className="card-hover cursor-pointer"
              onClick={() => setSelectedCandidate(app)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${app.userId}`} />
                    <AvatarFallback>U{app.userId}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">Candidate {app.userId}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{job?.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${stage?.color} text-white`}>
                        <StageIcon className="w-3 h-3 mr-1" />
                        {stage?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Applied {app.appliedAt.toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Candidate Tracking</h2>
          <p className="text-muted-foreground">Manage candidates through your hiring pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search candidates by job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          {renderPipeline()}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredApplications.map((app) => {
                  const job = jobs.find(j => j.id === app.jobId);
                  const stage = stages.find(s => s.id === app.status);

                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCandidate(app)}
                    >
                      <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${app.userId}`} />
                        <AvatarFallback>U{app.userId}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Candidate {app.userId}</p>
                        <p className="text-sm text-muted-foreground">{job?.title}</p>
                      </div>
                      <Badge className={`${stage?.color} text-white`}>
                        {stage?.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {app.appliedAt.toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-3xl font-bold">{applications.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">In Pipeline</p>
                <p className="text-3xl font-bold">{applications.filter(a => a.status !== 'hired' && a.status !== 'rejected').length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Hired</p>
                <p className="text-3xl font-bold text-green-500">{applications.filter(a => a.status === 'hired').length}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedCandidate.userId}`} />
                    <AvatarFallback>U{selectedCandidate.userId}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">Candidate {selectedCandidate.userId}</DialogTitle>
                    <DialogDescription className="text-lg">
                      {jobs.find(j => j.id === selectedCandidate.jobId)?.title}
                    </DialogDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge className={`${getStageColor(selectedCandidate.status)} text-white`}>
                        {stages.find(s => s.id === selectedCandidate.status)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View Resume
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {/* Stage Progression */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Update Stage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {stages.map((stage) => (
                        <Button
                          key={stage.id}
                          variant={selectedCandidate.status === stage.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleStatusChange(selectedCandidate.id, stage.id)}
                        >
                          <stage.icon className="w-4 h-4 mr-2" />
                          {stage.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Application Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Application Submitted</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCandidate.appliedAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium">Status Updated</p>
                          <p className="text-sm text-muted-foreground">
                            Moved to {stages.find(s => s.id === selectedCandidate.status)?.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCandidate.updatedAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedCandidate.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedCandidate.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Add Note */}
                <div className="space-y-2">
                  <Label>Add Note</Label>
                  <Textarea placeholder="Enter your notes about this candidate..." />
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Add Note
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
