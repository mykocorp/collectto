import { useState } from 'react';
import { useAuth } from './AuthContext';
import { AuthModal } from './AuthModal';
import { ThemeSelector } from './ThemeSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { User, LogOut } from 'lucide-react';

interface ProfileMenuProps {
  theme?: 'light' | 'dark' | 'oryso';
  onThemeChange?: (theme: 'light' | 'dark' | 'oryso') => void;
}

export function ProfileMenu({ theme = 'dark', onThemeChange }: ProfileMenuProps) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 bg-foreground text-background hover:bg-foreground/80"
          onClick={() => setAuthModalOpen(true)}
        >
          <span className="sr-only">Sign in</span>
        </Button>
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen} 
        />
      </>
    );
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <span className="text-sm font-medium">{userInitial}</span>
          <span className="sr-only">Profile menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        {onThemeChange && (
          <ThemeSelector theme={theme} onThemeChange={onThemeChange} />
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}