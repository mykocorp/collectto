import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'oryso';
  onThemeChange: (theme: 'light' | 'dark' | 'oryso') => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'light';
    return 'light'; // If oryso, go back to light
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onThemeChange(getNextTheme())}
      className="w-9 h-9 p-0"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : theme === 'oryso' ? (
        <Sun className="w-4 h-4 text-primary" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </Button>
  );
}