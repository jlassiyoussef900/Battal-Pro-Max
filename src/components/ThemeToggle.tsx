import { Moon, Sun, Sunrise } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const themes = ["dark", "light", "day"] as const;
type Theme = typeof themes[number];

const icons: Record<Theme, React.ReactNode> = {
  dark: <Moon className="h-5 w-5" />,
  light: <Sun className="h-5 w-5" />,
  day: <Sunrise className="h-5 w-5" />,
};

const labels: Record<Theme, string> = {
  dark: "Dark",
  light: "Light",
  day: "Day",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="glass-effect rounded-full w-10 h-10 border-border/50">
        <div className="w-5 h-5" />
      </Button>
    );
  }

  const current = (themes.includes(theme as Theme) ? theme : "dark") as Theme;
  const next = themes[(themes.indexOf(current) + 1) % themes.length];

  return (
    <Button
      variant="outline"
      size="icon"
      className="glass-effect rounded-full w-10 h-10 border-border/50 hover:bg-primary/10 hover:text-primary transition-all duration-300"
      onClick={() => setTheme(next)}
      title={`Switch to ${labels[next]} mode`}
    >
      {icons[current]}
      <span className="sr-only">{labels[current]} mode</span>
    </Button>
  );
}
