import { Button } from './ui/button';
import { Minimize2, Maximize2 } from 'lucide-react';

interface DenseToggleProps {
  dense: boolean;
  onDenseChange: (dense: boolean) => void;
}

export function DenseToggle({ dense, onDenseChange }: DenseToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onDenseChange(!dense)}
      className="h-8 w-8 p-0"
      title={dense ? "Switch to normal view" : "Switch to dense view"}
    >
      {dense ? (
        <Maximize2 className="w-4 h-4" />
      ) : (
        <Minimize2 className="w-4 h-4" />
      )}
    </Button>
  );
}