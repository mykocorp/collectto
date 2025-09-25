import { Palette, Sun, Moon, Zap } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';

interface ThemeSelectorProps {
  theme: 'light' | 'dark' | 'oryso';
  onThemeChange: (theme: 'light' | 'dark' | 'oryso') => void;
}

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="flex items-center">
        <Palette className="mr-2 h-4 w-4" />
        <span>Theme</span>
      </DropdownMenuLabel>
      <DropdownMenuItem 
        onClick={() => onThemeChange('light')}
        className={theme === 'light' ? 'bg-accent' : ''}
      >
        <Sun className="mr-2 h-4 w-4" />
        <span>Light</span>
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => onThemeChange('dark')}
        className={theme === 'dark' ? 'bg-accent' : ''}
      >
        <Moon className="mr-2 h-4 w-4" />
        <span>Dark</span>
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => onThemeChange('oryso')}
        className={theme === 'oryso' ? 'bg-accent' : ''}
      >
        <Zap className="mr-2 h-4 w-4" />
        <span>Oryso</span>
        <span className="ml-auto text-xs opacity-60">✨</span>
      </DropdownMenuItem>
    </>
  );
}