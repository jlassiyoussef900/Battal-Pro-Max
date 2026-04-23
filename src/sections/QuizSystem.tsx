import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Award,
  Code,
  MessageCircle,
  Languages,
  Brain,
  Briefcase,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Trophy,
  Star,
  TrendingUp,
  Lock,
  Zap,
  Target,
} from 'lucide-react';
import { Quiz, Badge as BadgeType, QuizAttempt } from '@/types';

const quizCategories = [
  { id: 'technical', name: 'Technical Skills', icon: Code, color: 'from-blue-500 to-indigo-600' },
  { id: 'soft', name: 'Soft Skills', icon: MessageCircle, color: 'from-green-500 to-emerald-600' },
  { id: 'language', name: 'Languages', icon: Languages, color: 'from-purple-500 to-pink-600' },
  { id: 'aptitude', name: 'Aptitude', icon: Brain, color: 'from-orange-500 to-red-600' },
];

export function QuizSystem() {
  const { quizzes, badges, quizAttempts, completeQuiz } = useMockData();
  const [activeTab, setActiveTab] = useState('available');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'code': return <Code className="w-5 h-5" />;
      case 'atom': return <Star className="w-5 h-5" />;
      case 'message-circle': return <MessageCircle className="w-5 h-5" />;
      case 'languages': return <Languages className="w-5 h-5" />;
      case 'brain': return <Brain className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
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

  const getLevelFromScore = (score: number): BadgeType['level'] => {
    if (score >= 95) return 'platinum';
    if (score >= 85) return 'gold';
    if (score >= 70) return 'silver';
    return 'bronze';
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
    setQuizCompleted(false);
    setQuizScore(0);
    setTimeRemaining(quiz.duration * 60);
  };

  const handleAnswer = (answer: string) => {
    if (!selectedQuiz) return;
    setAnswers({ ...answers, [selectedQuiz.questions[currentQuestion].id]: answer });
  };

  const nextQuestion = () => {
    if (selectedQuiz && currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitQuiz = () => {
    if (!selectedQuiz) return;

    let score = 0;
    selectedQuiz.questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer === q.correctAnswer) {
        score += q.points;
      }
    });

    const maxScore = selectedQuiz.questions.reduce((acc, q) => acc + q.points, 0);
    const percentage = Math.round((score / maxScore) * 100);

    setQuizScore(percentage);
    setQuizCompleted(true);
    completeQuiz(selectedQuiz.id, answers, score);
  };

  const renderQuizInterface = () => {
    if (!selectedQuiz) return null;

    if (quizCompleted) {
      const level = getLevelFromScore(quizScore);
      const passed = quizScore >= selectedQuiz.passingScore;

      return (
        <div className="text-center py-8">
          <div className={`w-24 h-24 rounded-full ${getBadgeClass(level)} mx-auto flex items-center justify-center mb-6`}>
            {passed ? <Trophy className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
          </div>

          <h3 className="text-2xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Quiz Completed'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {passed
              ? `You earned a ${level} badge with a score of ${quizScore}%!`
              : `You scored ${quizScore}%. The passing score is ${selectedQuiz.passingScore}%.`}
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <div className="text-center px-6 py-4 rounded-xl bg-muted">
              <p className="text-3xl font-bold">{quizScore}%</p>
              <p className="text-sm text-muted-foreground">Your Score</p>
            </div>
            <div className="text-center px-6 py-4 rounded-xl bg-muted">
              <p className="text-3xl font-bold">{selectedQuiz.passingScore}%</p>
              <p className="text-sm text-muted-foreground">Passing Score</p>
            </div>
          </div>

          {passed && (
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${getBadgeClass(level)} text-white mb-6`}>
              <Award className="w-5 h-5" />
              <span className="font-semibold capitalize">{level} Badge Earned!</span>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button onClick={() => setSelectedQuiz(null)}>
              Back to Quizzes
            </Button>
            {!passed && (
              <Button variant="outline" onClick={() => startQuiz(selectedQuiz)}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      );
    }

    const question = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {selectedQuiz.questions.length}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Question */}
        <div className="py-4">
          <h4 className="text-lg font-medium mb-6">{question.question}</h4>

          {question.type === 'multiple_choice' && question.options && (
            <RadioGroup
              value={answers[question.id] as string}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {question.options.map((option, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                    answers[question.id] === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'true_false' && (
            <RadioGroup
              value={answers[question.id] as string}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {['true', 'false'].map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                    answers[question.id] === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${option}`} />
                  <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer capitalize">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            Previous
          </Button>
          {currentQuestion < selectedQuiz.questions.length - 1 ? (
            <Button
              onClick={nextQuestion}
              disabled={!answers[question.id]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={!answers[question.id]}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quizzes & Badges</h2>
          <p className="text-muted-foreground">Earn verified badges to showcase your skills</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-semibold">{badges.length} Badges Earned</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="available">Available Quizzes</TabsTrigger>
          <TabsTrigger value="mybadges">My Badges</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quizCategories.map((category) => {
              const Icon = category.icon;
              const count = quizzes.filter(q => q.category.toLowerCase().includes(category.id)).length;
              return (
                <Card key={category.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium text-sm">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{count} quizzes</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quiz List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => {
              const attempted = quizAttempts.some(a => a.quizId === quiz.id);
              const bestAttempt = quizAttempts
                .filter(a => a.quizId === quiz.id)
                .sort((a, b) => b.percentage - a.percentage)[0];

              return (
                <Card key={quiz.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground">{quiz.category}</p>
                      </div>
                      {attempted && bestAttempt && (
                        <Badge className={getBadgeClass(getLevelFromScore(bestAttempt.percentage))}>
                          {bestAttempt.percentage}%
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {quiz.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {quiz.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {quiz.passingScore}% to pass
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      variant={attempted ? 'outline' : 'default'}
                      onClick={() => startQuiz(quiz)}
                    >
                      {attempted ? (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Retake Quiz
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="mybadges" className="space-y-6">
          {/* Badge Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['bronze', 'silver', 'gold', 'platinum'].map((level) => {
              const count = badges.filter(b => b.level === level).length;
              return (
                <Card key={level}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${getBadgeClass(level)} flex items-center justify-center`}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">{level}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className="card-hover overflow-hidden">
                <div className={`h-2 ${getBadgeClass(badge.level)}`} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${getBadgeClass(badge.level)} flex items-center justify-center flex-shrink-0`}>
                      {getBadgeIcon(badge.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {badge.level}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{badge.score}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned on {badge.earnedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {quizAttempts.map((attempt) => {
            const quiz = quizzes.find(q => q.id === attempt.quizId);
            if (!quiz) return null;

            return (
              <Card key={attempt.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${getBadgeClass(getLevelFromScore(attempt.percentage))} flex items-center justify-center`}>
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed on {attempt.completedAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getMatchColor(attempt.percentage)}`}>
                        {attempt.percentage}%
                      </p>
                      <Badge className="capitalize">{getLevelFromScore(attempt.percentage)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Quiz Dialog */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedQuiz?.title}</DialogTitle>
            <DialogDescription>{selectedQuiz?.description}</DialogDescription>
          </DialogHeader>
          {renderQuizInterface()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getMatchColor(score: number) {
  if (score >= 90) return 'text-green-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-muted-foreground';
}
