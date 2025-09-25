import { HelpCircle } from 'lucide-react';
import { HelpModal } from './HelpModal';

export function FloatingHelpButton() {
  return (
    <HelpModal>
      <button
        className="fixed bottom-4 right-4 w-8 h-8 bg-background border border-border rounded-full transition-colors duration-200 flex items-center justify-center z-50 hover:bg-accent"
        aria-label="Open help"
      >
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
      </button>
    </HelpModal>
  );
}