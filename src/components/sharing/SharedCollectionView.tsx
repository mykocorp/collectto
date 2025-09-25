import { useState, useEffect } from 'react';
// Using props instead of useParams since we have a simple router
interface SharedCollectionViewProps {
  shareId?: string;
}
import { Board } from '../Board';
import { ThemeToggle } from '../ThemeToggle';
import { DenseToggle } from '../DenseToggle';
import { Collection } from '../../App';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Loader2, AlertCircle, Info, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { FloatingHelpButton } from '../FloatingHelpButton';

export function SharedCollectionView({ shareId }: SharedCollectionViewProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "oryso">("dark");
  const [dense, setDense] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState(true);

  // Load theme preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("collectto-theme") as "light" | "dark" | "oryso" | null;
    const savedDense = localStorage.getItem("collectto-dense") === "true";

    if (savedTheme) {
      setTheme(savedTheme);
    }
    setDense(savedDense);
  }, []);

  // Apply theme and dense mode to document
  useEffect(() => {
    document.documentElement.className = `${theme} ${dense ? "dense" : ""}`.trim();
    localStorage.setItem("collectto-theme", theme);
  }, [theme, dense]);

  // Save dense preference
  useEffect(() => {
    localStorage.setItem("collectto-dense", dense.toString());
  }, [dense]);

  useEffect(() => {
    if (shareId && shareId.trim()) {
      loadSharedCollection(shareId.trim());
    } else {
      setError('No share ID provided');
      setLoading(false);
    }
  }, [shareId]);

  const loadSharedCollection = async (shareId: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-0d942fc1/shared/${shareId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || `Collection not found (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to load shared collection:', error);
      setError('Failed to load shared collection - network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading shared collection...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold">Collectto</h1>
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>
        <div className="p-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold">Collectto</h1>
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>
        <div className="p-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Collection not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`flex items-center justify-between border-b border-border ${dense ? "p-2" : "p-4"}`}>
        <div className={`flex items-center ${dense ? "gap-2" : "gap-4"}`}>
          <h1 className="text-xl font-bold">
            Collec<i className="!italic">tt</i>o
          </h1>
          <span className="text-muted-foreground">/</span>
          <h2 className="text-lg">
            {collection.name}
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Shared • Interactive Copy
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DenseToggle dense={dense} onDenseChange={setDense} />
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>
      </div>
      
      {/* Helpful banner explaining shared collection behavior */}
      {showBanner && (
        <div className={`border-b border-border ${dense ? "p-2" : "p-4"}`}>
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200 flex items-center justify-between">
              <span>This is shared collection, your edits won't impact original one</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <Board
        collection={collection}
        onUpdateCollection={(updatedCollection) => {
          // Allow local updates for shared collections - changes don't persist to master
          setCollection(updatedCollection);
        }}
        dense={dense}
        readOnly={false} // Allow interaction in shared collections
      />
      <FloatingHelpButton />
    </div>
  );
}