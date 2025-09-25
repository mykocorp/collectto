import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface HelpModalProps {
  children: React.ReactNode;
}

export function HelpModal({ children }: HelpModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[500px] p-6">
        <DialogTitle className="sr-only">Help & Information</DialogTitle>
        <DialogDescription className="sr-only">
          Information about how to use Collectto, a hobby and collection tracking app
        </DialogDescription>
        <div className="space-y-6">
          {/* Help content */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-5">
              <span className="font-medium text-foreground">collec</span>
              <span className="font-medium italic text-foreground">tt</span>
              <span className="font-medium text-foreground">o</span>
              <span className="text-foreground"> </span>
              <span>
                is a simple hoppy (or anything you imagine) tracker:
              </span>
            </p>
            
            <ul className="space-y-1 text-sm text-muted-foreground list-disc ml-5">
              <li>Create your own or grab template collection (boards)</li>
              <li>Drag & drop items from status lanes</li>
              <li>Add optional text description and links to each item</li>
              <li>Give optional rate for each completed card</li>
              <li>Share collection with the World when you create an account</li>
              <li>Export & Import collections JSON</li>
              <li>ADHD friendly by minimal design and interaction</li>
            </ul>
            
            <p className="text-sm text-muted-foreground leading-5">
              This is an alpha version, so some bugs still here 🪲
            </p>
          </div>
          
          {/* Close button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => setOpen(false)}
              className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}