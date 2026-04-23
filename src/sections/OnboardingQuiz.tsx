import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, ChevronRight, Sparkles, Zap, Award, Brain, Target, Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface QuestionStep {
  kind: 'question';
  id: string;
  text: string;
  options: string[];
}

interface AdStep {
  kind: 'ad';
  icon: React.ReactNode;
  headline: string;
  body: string;
  accent: string; // tailwind gradient classes
}

type Step = QuestionStep | AdStep;

const steps: Step[] = [
  {
    kind: 'question',
    id: 'status',
    text: 'Are you currently looking for a new job?',
    options: ['Actively looking', 'Open to opportunities', 'Just exploring', 'Not looking right now'],
  },
  {
    kind: 'question',
    id: 'job_type',
    text: 'What kind of job are you looking for?',
    options: ['Full-time', 'Part-time', 'Freelance / Contract', 'Internship', 'Remote only'],
  },
  {
    kind: 'ad',
    icon: <Zap className="w-10 h-10 text-yellow-400" />,
    headline: 'Swipe to Match — Like Tinder, but for Jobs',
    body: 'Our unique swipe system shows you jobs tailored to your profile. Like what you see? Swipe right and apply in one tap.',
    accent: 'from-yellow-500/20 to-orange-500/10',
  },
  {
    kind: 'question',
    id: 'priority',
    text: "What's most important to you in a new job?",
    options: ['Salary & Benefits', 'Work-Life Balance', 'Career Growth', 'Company Culture', 'Remote Work'],
  },
  {
    kind: 'question',
    id: 'salary',
    text: 'What is your expected monthly salary?',
    options: ['Under $2,000', '$2,000 – $4,000', '$4,000 – $7,000', '$7,000 – $12,000', '$12,000+'],
  },
  {
    kind: 'ad',
    icon: <Award className="w-10 h-10 text-purple-400" />,
    headline: 'Earn Badges, Stand Out',
    body: 'Complete skill quizzes and earn verified badges that appear on your profile. Companies love candidates who prove their skills.',
    accent: 'from-purple-500/20 to-pink-500/10',
  },
  {
    kind: 'question',
    id: 'interviews',
    text: 'How many interviews per week are you comfortable with?',
    options: ['1 – just testing the waters', '2–3 – steady pace', '4–5 – I\'m serious', '6+ – full throttle'],
  },
  {
    kind: 'question',
    id: 'experience',
    text: 'How many years of work experience do you have?',
    options: ['Less than 1 year', '1–3 years', '3–6 years', '6–10 years', '10+ years'],
  },
  {
    kind: 'ad',
    icon: <Brain className="w-10 h-10 text-blue-400" />,
    headline: 'AI-Powered Match Score',
    body: 'Our algorithm scores every job against your skills, salary expectations, and preferences — so you only see roles worth your time.',
    accent: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    kind: 'question',
    id: 'apps',
    text: 'Have you used other job search platforms before?',
    options: ['Yes, LinkedIn', 'Yes, Indeed', 'Yes, multiple platforms', 'No, this is my first'],
  },
  {
    kind: 'question',
    id: 'goal',
    text: 'What is your main goal on this platform?',
    options: ['Find a job fast', 'Explore options', 'Build my profile', 'Improve my skills'],
  },
  {
    kind: 'ad',
    icon: <Shield className="w-10 h-10 text-green-400" />,
    headline: 'Your Data, Your Control',
    body: 'We never share your personal information without your consent. You decide who sees your profile and when.',
    accent: 'from-green-500/20 to-teal-500/10',
  },
];

const totalQuestions = steps.filter(s => s.kind === 'question').length;

interface Props {
  onComplete: () => void;
}

export function OnboardingQuiz({ onComplete }: Props) {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const step = steps[current];

  // Count how many questions have been answered so far
  const answeredQuestions = steps
    .slice(0, current)
    .filter(s => s.kind === 'question').length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  const handleNext = () => {
    if (step.kind === 'question') {
      if (!selected) return;
      setAnswers(prev => ({ ...prev, [step.id]: selected }));
      setSelected(null);
    }
    if (current + 1 < steps.length) {
      setCurrent(current + 1);
    } else {
      setDone(true);
    }
  };

  // Welcome screen
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 animate-fade-in">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse-glow">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">
            You're all set, <span className="gradient-text">{user?.firstName}</span>! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            We've personalised your experience. Time to find your perfect match.
          </p>
          <div className="space-y-1">
            <Progress value={100} className="h-3 transition-all duration-1000" />
            <p className="text-xs text-right text-muted-foreground">100% complete</p>
          </div>
          <Button className="w-full" size="lg" onClick={onComplete}>
            Enter Battal Pro Max
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Ad / interstitial slide
  if (step.kind === 'ad') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg space-y-8 animate-slide-up">
          {/* Progress */}
          <div className="space-y-1">
            <Progress value={progress} className="h-2 transition-all duration-500" />
            <p className="text-xs text-right text-muted-foreground">{progress}% complete</p>
          </div>

          {/* Ad card */}
          <div className={`rounded-2xl border border-border/50 bg-gradient-to-br ${step.accent} p-8 text-center space-y-4`}>
            <div className="w-16 h-16 rounded-2xl bg-background/60 flex items-center justify-center mx-auto">
              {step.icon}
            </div>
            <h2 className="text-2xl font-bold">{step.headline}</h2>
            <p className="text-muted-foreground leading-relaxed">{step.body}</p>
          </div>

          <Button className="w-full" size="lg" onClick={handleNext}>
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Question slide
  const questionNumber = steps.slice(0, current + 1).filter(s => s.kind === 'question').length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg space-y-8 animate-slide-up">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </p>
          <h2 className="text-2xl font-bold">{step.text}</h2>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2 transition-all duration-500" />
          <p className="text-xs text-right text-muted-foreground">{progress}% complete</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {step.options.map((option) => (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all duration-200 ${
                selected === option
                  ? 'border-primary bg-primary/10 text-primary font-medium scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <span>{option}</span>
              {selected === option && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          className="w-full"
          size="lg"
          disabled={!selected}
          onClick={handleNext}
        >
          {answeredQuestions + 1 === totalQuestions ? 'Finish' : 'Next'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
