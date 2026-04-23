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
import { Slider } from '@/components/ui/slider';
import {
  Plus,
  FileText,
  Clock,
  Target,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Video,
  Shuffle,
  Award,
  TrendingUp,
  Code,
  BookOpen,
  ChevronRight,
  Star,
} from 'lucide-react';
import { CustomTest, TestResult } from '@/types';

const questionTypes = [
  { id: 'multiple_choice', name: 'Multiple Choice', icon: Target },
  { id: 'true_false', name: 'True/False', icon: CheckCircle },
  { id: 'short_answer', name: 'Short Answer', icon: FileText },
  { id: 'coding', name: 'Coding Challenge', icon: Code },
  { id: 'file_upload', name: 'File Upload', icon: FileText },
];

// Pre-built Question Banks with Junior/Senior level questions
const questionBanks = [
  {
    id: 'js-fundamentals',
    name: 'JavaScript Fundamentals',
    count: 24,
    category: 'Programming',
    icon: '💻',
    description: 'Core JavaScript concepts from basics to advanced',
    questions: {
      junior: [
        { question: 'What is the output of typeof []?', options: ['array', 'object', 'undefined', 'null'], correct: 'object', explanation: 'Arrays are objects in JavaScript.' },
        { question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct: 'push()', explanation: 'push() adds elements to the end.' },
        { question: 'What does "===" do?', options: ['Loose equality', 'Strict equality', 'Assignment', 'None'], correct: 'Strict equality', explanation: '=== checks value and type.' },
        { question: 'How do you declare a constant variable?', options: ['var', 'let', 'const', 'static'], correct: 'const', explanation: 'const declares constants.' },
        { question: 'What is the result of 2 + "2"?', options: ['4', '22', 'NaN', 'Error'], correct: '22', explanation: 'String concatenation happens.' },
        { question: 'Which loop is best for iterating over arrays?', options: ['for', 'while', 'for...of', 'do...while'], correct: 'for...of', explanation: 'for...of is designed for iterables.' },
      ],
      senior: [
        { question: 'What is event bubbling and how can you stop it?', options: ['Event propagation upward, use stopPropagation()', 'Event downward, use preventDefault()', 'No such concept', 'Use capture phase'], correct: 'Event propagation upward, use stopPropagation()', explanation: 'Events bubble up the DOM tree.' },
        { question: 'Explain closures in JavaScript.', options: ['Function with preserved scope', 'Loop closure', 'Variable hoisting', 'None'], correct: 'Function with preserved scope', explanation: 'Closures remember their lexical scope.' },
        { question: 'What is the difference between microtasks and macrotasks?', options: ['Execution priority order', 'No difference', 'Syntax difference', 'Browser vs Node'], correct: 'Execution priority order', explanation: 'Microtasks execute before macrotasks.' },
        { question: 'How does prototypal inheritance work?', options: ['Objects inherit from objects via prototype chain', 'Class-based inheritance', 'No inheritance', 'Copy-based'], correct: 'Objects inherit from objects via prototype chain', explanation: 'JS uses prototype chain for inheritance.' },
        { question: 'What is a Promise and how do async/await work with it?', options: ['Async operation handler, syntactic sugar', 'Synchronous code', 'Callback only', 'None'], correct: 'Async operation handler, syntactic sugar', explanation: 'Promises handle async operations.' },
        { question: 'Explain the event loop in JavaScript.', options: ['Call stack + callback queue mechanism', 'Single thread loop', 'For loop variant', 'None'], correct: 'Call stack + callback queue mechanism', explanation: 'Event loop manages async execution.' },
      ],
    },
  },
  {
    id: 'react-frontend',
    name: 'React & Frontend',
    count: 20,
    category: 'Programming',
    icon: '⚛️',
    description: 'React concepts, hooks, and patterns',
    questions: {
      junior: [
        { question: 'What hook manages state in React?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correct: 'useState', explanation: 'useState is for state management.' },
        { question: 'What is JSX?', options: ['JavaScript XML', 'JSON extension', 'Java syntax', 'None'], correct: 'JavaScript XML', explanation: 'JSX is syntactic sugar for React elements.' },
        { question: 'How do you pass data from parent to child?', options: ['Props', 'State', 'Context', 'Redux'], correct: 'Props', explanation: 'Props pass data down the component tree.' },
        { question: 'What is the purpose of key prop in lists?', options: ['Help React identify items', 'Styling', 'Accessibility', 'None'], correct: 'Help React identify items', explanation: 'Keys help with reconciliation.' },
        { question: 'What does useEffect do?', options: ['Handle side effects', 'Manage state', 'Create context', 'None'], correct: 'Handle side effects', explanation: 'useEffect handles side effects.' },
      ],
      senior: [
        { question: 'Explain React Fiber architecture.', options: ['Reconciliation algorithm rewrite', 'New component type', 'Styling system', 'None'], correct: 'Reconciliation algorithm rewrite', explanation: 'Fiber enables incremental rendering.' },
        { question: 'What are React Server Components?', options: ['Components that render on server', 'Static components', 'Class components', 'None'], correct: 'Components that render on server', explanation: 'RSCs execute on the server.' },
        { question: 'How does useMemo differ from useCallback?', options: ['Memoizes values vs functions', 'No difference', 'Callback is for effects', 'None'], correct: 'Memoizes values vs functions', explanation: 'useMemo memoizes values, useCallback functions.' },
        { question: 'Explain the Context API performance considerations.', options: ['Unnecessary re-renders', 'No issues', 'Only for small apps', 'None'], correct: 'Unnecessary re-renders', explanation: 'Context changes trigger re-renders.' },
        { question: 'What is code splitting and how to implement it?', options: ['Lazy loading with React.lazy', 'Webpack only', 'Not possible', 'None'], correct: 'Lazy loading with React.lazy', explanation: 'React.lazy enables code splitting.' },
      ],
    },
  },
  {
    id: 'data-structures',
    name: 'Data Structures & Algorithms',
    count: 18,
    category: 'Computer Science',
    icon: '📊',
    description: 'Fundamental CS concepts for technical interviews',
    questions: {
      junior: [
        { question: 'What is the time complexity of accessing an array element?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 'O(1)', explanation: 'Arrays have constant time access.' },
        { question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Array', 'Tree'], correct: 'Stack', explanation: 'Stacks are Last In First Out.' },
        { question: 'What is binary search time complexity?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct: 'O(log n)', explanation: 'Binary search halves the search space.' },
        { question: 'What data structure is best for priority queues?', options: ['Array', 'Heap', 'Stack', 'Queue'], correct: 'Heap', explanation: 'Heaps efficiently manage priorities.' },
      ],
      senior: [
        { question: 'Explain how a B-tree differs from a binary search tree.', options: ['Multi-way tree with balanced structure', 'Same thing', 'B-tree is binary', 'None'], correct: 'Multi-way tree with balanced structure', explanation: 'B-trees have multiple keys per node.' },
        { question: 'What is dynamic programming and when to use it?', options: ['Optimization with memoization', 'Any recursive problem', 'Only sorting', 'None'], correct: 'Optimization with memoization', explanation: 'DP solves overlapping subproblems.' },
        { question: 'Explain Dijkstra\'s algorithm.', options: ['Shortest path in weighted graph', 'Sorting algorithm', 'Search algorithm', 'None'], correct: 'Shortest path in weighted graph', explanation: 'Dijkstra finds shortest paths.' },
        { question: 'What is the difference between DFS and BFS?', options: ['Stack vs Queue, depth vs breadth', 'Same thing', 'Only tree traversal', 'None'], correct: 'Stack vs Queue, depth vs breadth', explanation: 'DFS uses stack, BFS uses queue.' },
      ],
    },
  },
  {
    id: 'system-design',
    name: 'System Design',
    count: 16,
    category: 'Architecture',
    icon: '🏗️',
    description: 'Design scalable distributed systems',
    questions: {
      junior: [
        { question: 'What is horizontal scaling?', options: ['Adding more machines', 'Upgrading hardware', 'Database optimization', 'None'], correct: 'Adding more machines', explanation: 'Horizontal scaling adds instances.' },
        { question: 'What is a load balancer?', options: ['Distributes traffic', 'Database tool', 'Cache system', 'None'], correct: 'Distributes traffic', explanation: 'Load balancers distribute requests.' },
        { question: 'What is caching used for?', options: ['Reduce database load', 'Security', 'Authentication', 'None'], correct: 'Reduce database load', explanation: 'Caching stores frequently accessed data.' },
      ],
      senior: [
        { question: 'Design a URL shortening service.', options: ['Hash + database with collision handling', 'Random strings only', 'No database needed', 'None'], correct: 'Hash + database with collision handling', explanation: 'Requires unique mapping and storage.' },
        { question: 'How would you design a rate limiter?', options: ['Token bucket or sliding window', 'Block all requests', 'No limit needed', 'None'], correct: 'Token bucket or sliding window', explanation: 'Common rate limiting algorithms.' },
        { question: 'Explain CAP theorem.', options: ['Consistency, Availability, Partition tolerance', 'Security principle', 'Performance metric', 'None'], correct: 'Consistency, Availability, Partition tolerance', explanation: 'Distributed systems trade-offs.' },
        { question: 'Design a distributed message queue.', options: ['Producer-consumer with persistence', 'Simple array', 'Database only', 'None'], correct: 'Producer-consumer with persistence', explanation: 'Requires reliability and ordering.' },
      ],
    },
  },
  {
    id: 'behavioral',
    name: 'Behavioral Questions',
    count: 20,
    category: 'Soft Skills',
    icon: '🤝',
    description: 'STAR method behavioral interview questions',
    questions: {
      junior: [
        { question: 'Tell me about a time you faced a challenge at work.', options: ['Use STAR method', 'Skip it', 'Be vague', 'None'], correct: 'Use STAR method', explanation: 'STAR: Situation, Task, Action, Result.' },
        { question: 'How do you handle conflicting priorities?', options: ['Prioritize by impact/urgency', 'Work on all at once', 'Avoid conflicts', 'None'], correct: 'Prioritize by impact/urgency', explanation: 'Effective prioritization is key.' },
        { question: 'Describe a time you received critical feedback.', options: ['Show growth mindset', 'Defensive response', 'Ignore it', 'None'], correct: 'Show growth mindset', explanation: 'Demonstrate ability to learn.' },
      ],
      senior: [
        { question: 'Tell me about a time you influenced without authority.', options: ['Build consensus with data', 'Use authority anyway', 'Give up', 'None'], correct: 'Build consensus with data', explanation: 'Leadership through influence.' },
        { question: 'Describe a failed project and what you learned.', options: ['Honest reflection on lessons', 'Blame others', 'Deny failure', 'None'], correct: 'Honest reflection on lessons', explanation: 'Show accountability and growth.' },
        { question: 'How do you handle team conflict?', options: ['Mediate and find common ground', 'Take sides', 'Ignore it', 'None'], correct: 'Mediate and find common ground', explanation: 'Conflict resolution skills.' },
        { question: 'Tell me about mentoring someone.', options: ['Share specific examples', 'Never mentored', 'Generic answer', 'None'], correct: 'Share specific examples', explanation: 'Show leadership and teaching.' },
      ],
    },
  },
  {
    id: 'sql-databases',
    name: 'SQL & Databases',
    count: 15,
    category: 'Data',
    icon: '🗄️',
    description: 'Database design and SQL queries',
    questions: {
      junior: [
        { question: 'What does SELECT * do?', options: ['Selects all columns', 'Selects all rows', 'Selects specific columns', 'None'], correct: 'Selects all columns', explanation: '* is a wildcard for all columns.' },
        { question: 'What is a PRIMARY KEY?', options: ['Unique identifier', 'Foreign reference', 'Index type', 'None'], correct: 'Unique identifier', explanation: 'Primary keys uniquely identify rows.' },
        { question: 'What is the difference between INNER and LEFT JOIN?', options: ['Matching rows only vs all left rows', 'Same thing', 'Performance only', 'None'], correct: 'Matching rows only vs all left rows', explanation: 'LEFT JOIN includes non-matching left rows.' },
      ],
      senior: [
        { question: 'Explain database normalization.', options: ['Reduce redundancy, ensure integrity', 'Add more tables', 'Performance optimization', 'None'], correct: 'Reduce redundancy, ensure integrity', explanation: 'Normalization organizes data efficiently.' },
        { question: 'What are database indexes and trade-offs?', options: ['Faster reads, slower writes', 'Always beneficial', 'Only for primary keys', 'None'], correct: 'Faster reads, slower writes', explanation: 'Indexes speed up queries but add overhead.' },
        { question: 'Explain ACID properties.', options: ['Atomicity, Consistency, Isolation, Durability', 'Performance metrics', 'SQL commands', 'None'], correct: 'Atomicity, Consistency, Isolation, Durability', explanation: 'ACID ensures reliable transactions.' },
      ],
    },
  },
];

export function SkillTesting() {
  const { customTests, testResults, applications, setCustomTests } = useMockData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<CustomTest | null>(null);
  const [selectedBank, setSelectedBank] = useState<typeof questionBanks[0] | null>(null);
  const [activeTab, setActiveTab] = useState('tests');

  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    questions: [] as Array<{
      type: string;
      question: string;
      options?: string[];
      correctAnswer?: string;
      points: number;
    }>,
    settings: {
      timeLimit: 30,
      passingScore: 70,
      maxAttempts: 1,
      randomizeQuestions: false,
      proctoringEnabled: false,
    },
  });

  const getTestResults = (testId: string) => testResults.filter(r => r.testId === testId);

  const getAverageScore = (testId: string) => {
    const results = getTestResults(testId);
    if (results.length === 0) return 0;
    return Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length);
  };

  const getPassRate = (testId: string) => {
    const results = getTestResults(testId);
    if (results.length === 0) return 0;
    return Math.round((results.filter(r => r.passed).length / results.length) * 100);
  };

  // Handle view test questions
  const handleViewTest = (test: CustomTest) => {
    setSelectedTest(test);
    setShowViewDialog(true);
  };

  // Handle delete test
  const handleDeleteClick = (test: CustomTest) => {
    setSelectedTest(test);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedTest) return;
    const updatedTests = customTests.filter(t => t.id !== selectedTest.id);
    (setCustomTests as any)(updatedTests);
    setShowDeleteDialog(false);
    setSelectedTest(null);
  };

  // Handle view question bank
  const handleViewBank = (bank: typeof questionBanks[0]) => {
    setSelectedBank(bank);
    setShowBankDialog(true);
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Skill Testing</h2>
          <p className="text-muted-foreground">Create and manage custom skill assessments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Test
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">My Tests ({customTests.length})</TabsTrigger>
          <TabsTrigger value="library">Question Library</TabsTrigger>
          <TabsTrigger value="results">Results ({testResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {customTests.map((test) => {
            const results = getTestResults(test.id);
            const avgScore = getAverageScore(test.id);
            const passRate = getPassRate(test.id);

            return (
              <Card key={test.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{test.title}</h3>
                        {test.settings.proctoringEnabled && (
                          <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                            <Video className="w-3 h-3 mr-1" />
                            Proctored
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {test.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {test.questions.length} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {test.settings.timeLimit} min
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {test.settings.passingScore}% to pass
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {results.length} attempts
                        </span>
                      </div>

                      {results.length > 0 && (
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="text-sm">Avg: {avgScore}%</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Pass: {passRate}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewTest(test)} title="View Questions">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Edit Test">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteClick(test)} 
                        title="Delete Test"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {questionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="card-hover cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold">{type.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.id === 'multiple_choice' && 'Single or multiple correct answers'}
                      {type.id === 'true_false' && 'Simple true or false questions'}
                      {type.id === 'short_answer' && 'Free text responses'}
                      {type.id === 'coding' && 'Code evaluation with test cases'}
                      {type.id === 'file_upload' && 'Document or portfolio submissions'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Pre-built Question Banks
              </CardTitle>
              <CardDescription>Ready-to-use questions organized by skill and difficulty level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questionBanks.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{bank.icon}</span>
                      <div>
                        <p className="font-medium">{bank.name}</p>
                        <p className="text-sm text-muted-foreground">{bank.category} • {bank.count} questions</p>
                        <p className="text-xs text-muted-foreground mt-1">{bank.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {bank.questions.junior.length} Junior
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            {bank.questions.senior.length} Senior
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewBank(bank)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.map((result) => {
            const test = customTests.find(t => t.id === result.testId);
            const application = applications.find(a => a.id === result.applicationId);

            return (
              <Card key={result.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {result.passed ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{test?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Candidate ID: {result.userId} • {result.completedAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                        {result.percentage}%
                      </p>
                      <Badge variant={result.passed ? 'default' : 'secondary'}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Create Test Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Skill Test</DialogTitle>
            <DialogDescription>
              Design a custom assessment for your candidates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>Test Title *</Label>
                <Input
                  placeholder="e.g., Frontend Developer Assessment"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this test evaluates..."
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                />
              </div>
            </div>

            {/* Test Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time Limit (minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[newTest.settings.timeLimit]}
                        onValueChange={(value) => setNewTest({
                          ...newTest,
                          settings: { ...newTest.settings, timeLimit: value[0] }
                        })}
                        min={5}
                        max={180}
                        step={5}
                      />
                      <span className="w-12 text-right">{newTest.settings.timeLimit}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Passing Score (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[newTest.settings.passingScore]}
                        onValueChange={(value) => setNewTest({
                          ...newTest,
                          settings: { ...newTest.settings, passingScore: value[0] }
                        })}
                        min={50}
                        max={100}
                        step={5}
                      />
                      <span className="w-12 text-right">{newTest.settings.passingScore}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Attempts</Label>
                    <Select
                      value={newTest.settings.maxAttempts.toString()}
                      onValueChange={(value) => setNewTest({
                        ...newTest,
                        settings: { ...newTest.settings, maxAttempts: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="-1">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newTest.settings.randomizeQuestions}
                      onCheckedChange={(checked) => setNewTest({
                        ...newTest,
                        settings: { ...newTest.settings, randomizeQuestions: checked }
                      })}
                    />
                    <Label className="flex items-center gap-2">
                      <Shuffle className="w-4 h-4" />
                      Randomize Questions
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newTest.settings.proctoringEnabled}
                      onCheckedChange={(checked) => setNewTest({
                        ...newTest,
                        settings: { ...newTest.settings, proctoringEnabled: checked }
                      })}
                    />
                    <Label className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Enable Proctoring
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Test Questions Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Test Questions
            </DialogTitle>
            <DialogDescription>
              {selectedTest?.title} - {selectedTest?.questions.length} questions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedTest?.questions.map((q, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium mb-2">{q.question}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary">{q.type.replace('_', ' ')}</Badge>
                        <Badge variant="outline">{q.points} points</Badge>
                        {q.category && <Badge variant="secondary">{q.category}</Badge>}
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-sm text-muted-foreground">Options:</p>
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt, j) => (
                              <span 
                                key={j} 
                                className={`text-sm px-2 py-1 rounded ${
                                  opt === q.correctAnswer 
                                    ? 'bg-green-500/20 text-green-600' 
                                    : 'bg-muted'
                                }`}
                              >
                                {opt} {opt === q.correctAnswer && '✓'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Test
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedTest && (
            <div className="p-4 rounded-lg bg-muted mt-4">
              <p className="font-medium">{selectedTest.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTest.questions.length} questions • {selectedTest.settings.timeLimit} minutes
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Bank Preview Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedBank?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedBank?.description} • {selectedBank?.count} questions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Junior Level Questions */}
            {selectedBank?.questions.junior && selectedBank.questions.junior.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Junior Level ({selectedBank.questions.junior.length} questions)
                </h3>
                <div className="space-y-3">
                  {selectedBank.questions.junior.map((q, i) => (
                    <Card key={`j-${i}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-sm font-medium text-yellow-600 flex-shrink-0">
                            J{i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium mb-2">{q.question}</p>
                            {q.options && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {q.options.map((opt, j) => (
                                  <span 
                                    key={j} 
                                    className={`text-sm px-2 py-1 rounded ${
                                      opt === q.correct 
                                        ? 'bg-green-500/20 text-green-600' 
                                        : 'bg-muted'
                                    }`}
                                  >
                                    {opt} {opt === q.correct && '✓'}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Senior Level Questions */}
            {selectedBank?.questions.senior && selectedBank.questions.senior.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Senior Level ({selectedBank.questions.senior.length} questions)
                </h3>
                <div className="space-y-3">
                  {selectedBank.questions.senior.map((q, i) => (
                    <Card key={`s-${i}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-sm font-medium text-purple-600 flex-shrink-0">
                            S{i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium mb-2">{q.question}</p>
                            {q.options && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {q.options.map((opt, j) => (
                                  <span 
                                    key={j} 
                                    className={`text-sm px-2 py-1 rounded ${
                                      opt === q.correct 
                                        ? 'bg-green-500/20 text-green-600' 
                                        : 'bg-muted'
                                    }`}
                                  >
                                    {opt} {opt === q.correct && '✓'}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
