import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  target: string | null; // CSS selector of the element to highlight, null = center screen
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: TutorialStep[] = [
  {
    title: 'Welcome to Battal Pro Max! 🎉',
    description: "This quick tour will show you everything you need to get started. It only takes 30 seconds!",
    target: null,
    position: 'center',
  },
  {
    title: '🔍 Discover Jobs',
    description: 'Click "Discover Jobs" to browse jobs tailored to your profile. Swipe right to like, left to skip — just like Tinder!',
    target: '[data-tutorial="nav-jobs"]',
    position: 'right',
  },
  {
    title: '❤️ Liked Jobs',
    description: 'All the jobs you swiped right on are saved here. Apply to them anytime at your own pace.',
    target: '[data-tutorial="nav-liked"]',
    position: 'right',
  },
  {
    title: '🏆 Quizzes & Badges',
    description: 'Take skill quizzes to earn verified badges. Badges appear on your profile and make you stand out to recruiters.',
    target: '[data-tutorial="nav-badges"]',
    position: 'right',
  },
  {
    title: '📄 CV Generator',
    description: 'Build a professional, ATS-optimised CV in minutes using your profile data. Download it as PDF instantly.',
    target: '[data-tutorial="nav-cv"]',
    position: 'right',
  },
  {
    title: '📊 Statistics',
    description: 'Track your application progress, profile views, and match scores all in one place.',
    target: '[data-tutorial="nav-statistics"]',
    position: 'right',
  },
  {
    title: '⚙️ Settings & Profile',
    description: 'Update your preferences, expected salary, and job type anytime to keep your matches fresh.',
    target: '[data-tutorial="nav-settings"]',
    position: 'right',
  },
  {
    title: "You're ready! 🚀",
    description: "That's everything! Start by discovering jobs or completing a quiz to earn your first badge. Good luck!",
    target: null,
    position: 'center',
  },
];

interface Rect { top: number; left: number; width: number; height: number; }

interface Props {
  onComplete: () => void;
}

export function TutorialOverlay({ onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[current];

  useEffect(() => {
    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [current, step.target]);

  const goNext = () => {
    if (current + 1 < steps.length) setCurrent(current + 1);
    else onComplete();
  };

  const goPrev = () => { if (current > 0) setCurrent(current - 1); };

  const PAD = 8;
  const spotlightStyle = targetRect
    ? {
        top: targetRect.top - PAD,
        left: targetRect.left - PAD,
        width: targetRect.width + PAD * 2,
        height: targetRect.height + PAD * 2,
      }
    : null;

  // Tooltip position relative to spotlight
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return {};
    const GAP = 16;
    switch (step.position) {
      case 'right':
        return { top: targetRect.top - PAD, left: targetRect.left + targetRect.width + PAD + GAP };
      case 'left':
        return { top: targetRect.top - PAD, right: window.innerWidth - targetRect.left + PAD + GAP };
      case 'bottom':
        return { top: targetRect.top + targetRect.height + PAD + GAP, left: targetRect.left - PAD };
      case 'top':
        return { bottom: window.innerHeight - targetRect.top + PAD + GAP, left: targetRect.left - PAD };
      default:
        return {};
    }
  };

  const progress = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'normal' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightStyle && (
              <rect
                x={spotlightStyle.left}
                y={spotlightStyle.top}
                width={spotlightStyle.width}
                height={spotlightStyle.height}
                rx="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {spotlightStyle && (
        <div
          className="absolute rounded-xl ring-2 ring-primary ring-offset-0 pointer-events-none transition-all duration-300"
          style={spotlightStyle}
        />
      )}

      {/* Tooltip / Card */}
      <div
        ref={tooltipRef}
        className={`absolute z-10 w-80 bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in transition-all duration-300 ${
          step.position === 'center' || !targetRect
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : ''
        }`}
        style={targetRect ? getTooltipStyle() : {}}
      >
        {/* Skip */}
        <button
          onClick={onComplete}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon for first/last */}
        {(current === 0 || current === steps.length - 1) && (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
        )}

        <div>
          <h3 className="font-bold text-lg leading-tight">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'bg-primary w-6' : i < current ? 'bg-primary/40 w-3' : 'bg-muted w-3'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={current === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">{current + 1} / {steps.length}</span>
          <Button size="sm" onClick={goNext} className="gap-1">
            {current + 1 === steps.length ? 'Done' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
