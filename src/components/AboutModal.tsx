import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { imgLogo } from '../imports/svg-ac0h0';

interface AboutModalProps {
  children: React.ReactNode;
}

function AnimatedGradientBox() {
  return (
    <div className="relative w-[188px] h-[186px] rounded-lg overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(45deg, 
              #4f46e5, #7c3aed, #db2777, #dc2626, 
              #ea580c, #d97706, #65a30d, #16a34a, 
              #059669, #0891b2, #0284c7, #2563eb, #4f46e5
            )`,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 12s ease-in-out infinite'
        }}
      />
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse at center, 
              transparent 20%, 
              rgba(0,0,0,0.1) 50%, 
              rgba(0,0,0,0.3) 100%
            )`,
          animation: 'wave 8s ease-in-out infinite alternate'
        }}
      />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[77px] h-[57px]">
        <img 
          className="w-full h-full object-contain brightness-0 invert" 
          src={imgLogo} 
          alt="Collectto Logo"
        />
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            20% { background-position: 100% 0%; }
            40% { background-position: 100% 100%; }
            60% { background-position: 50% 100%; }
            80% { background-position: 0% 100%; }
          }
          @keyframes wave {
            0% { transform: scale(2) rotate(0deg); }
            25% { transform: scale(2.05) rotate(90deg); }
            50% { transform: scale(2.1) rotate(180deg); }
            75% { transform: scale(2.05) rotate(270deg); }
            100% { transform: scale(2) rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}

export function AboutModal({ children }: AboutModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[500px] p-6 [&>button]:hidden">
        <DialogTitle className="sr-only">About Collectto</DialogTitle>
        <DialogDescription className="sr-only">
          Information about Collectto, a minimalist board-based app for tracking hobbies and collections
        </DialogDescription>
        <div className="flex gap-6 items-start">
          <AnimatedGradientBox />
          <div className="flex-1 space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">collec</span>
                <span className="font-medium italic text-foreground">tt</span>
                <span className="font-medium text-foreground">o</span>
                {` is a minimalist & fun way to track your hobbies, their states and progress, and then share it with the world.`}
              </p>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">collec</span>
                <span className="font-medium italic text-foreground">tt</span>
                <span className="font-medium text-foreground">o</span>
                {` is a pet project of `}
                <a 
                  href="https://kolyakorzh.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                >
                  mykola korzh
                </a>
                {` created for #figmamakeathon in september 2025.`}
              </p>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                Being a hard-to-focus person, I find it calming to track things I've been (and plan) doing.
              </p>
            </div>
            
            <div className="flex justify-end pt-2">
              <DialogClose asChild>
                <Button 
                  variant="default" 
                  size="sm"
                >
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}