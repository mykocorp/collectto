import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Plus, FolderOpen, Download, Upload, Trash2, ChevronDown } from 'lucide-react';
import { Collection } from '../App';
import { imgLogo } from '../imports/svg-ac0h0';

interface CollectionManagerProps {
  collections: Collection[];
  activeCollection?: Collection;
  onAddCollection: (presetKey: string) => void;
  onSelectCollection: (collection: Collection) => void;
  onDeleteCollection: (collectionId: string) => void;
  onExportCollection?: (collection: Collection) => void;
  onImportCollection?: (collection: Collection) => void;
  presets: Record<string, any>;
  compact?: boolean;
}

export function CollectionManager({
  collections,
  activeCollection,
  onAddCollection,
  onSelectCollection,
  onDeleteCollection,
  onExportCollection,
  onImportCollection,
  presets,
  compact = false
}: CollectionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('games');
  const [customName, setCustomName] = useState('');

  const createCollection = () => {
    onAddCollection(selectedPreset);
    setIsCreateDialogOpen(false);
    setCustomName('');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement> | Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        console.log('Parsed data:', data);
        
        // Validate the imported data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid collection format');
        }
        
        // Check for required fields
        if (!data.name || !data.columns || !Array.isArray(data.columns)) {
          throw new Error('Invalid collection structure');
        }
        
        // Validate columns structure
        const isValidColumns = data.columns.every((col: any) => 
          col && typeof col === 'object' && 
          col.id && col.title && Array.isArray(col.cards)
        );
        
        if (!isValidColumns) {
          throw new Error('Invalid columns structure');
        }
        
        // Create a new collection with unique ID and proper structure
        const importedCollection: Collection = {
          ...data,
          id: Date.now().toString(), // Generate new unique ID
          columns: data.columns.map((col: any) => ({
            ...col,
            cards: col.cards || [],
            rate: col.rate || false,
            color: col.color || ''
          }))
        };
        
        console.log('About to import collection:', importedCollection);
        console.log('onImportCollection function exists:', !!onImportCollection);
        
        if (onImportCollection) {
          onImportCollection(importedCollection);
          console.log('Import function called successfully');
        } else {
          console.log('No import function provided');
        }
        
      } catch (error) {
        console.error('Import error:', error);
        alert(error instanceof Error ? error.message : 'Invalid file format. Please ensure the file is a valid Collectto collection export.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    target.value = '';
  };

  if (!compact && collections.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center mt-24">
          <img 
            className="w-16 h-16 mx-auto mb-4 brightness-0 dark:brightness-0 dark:invert" 
            src={imgLogo} 
            alt="Collectto Logo"
          />
          <h2 className="text-xl mb-2">Welcome to Collectto</h2>
          <p className="text-muted-foreground mb-6">
            Create your first collection to start tracking your hobbies
          </p>
          
          <div className="flex justify-center gap-3">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>
                  Choose a template to create a new collection for tracking your hobbies.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template</label>
                  <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(presets).map(([key, preset]) => (
                        <SelectItem key={key} value={key}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button onClick={createCollection} className="w-full">
                    Create Collection
                  </Button>
                </div>
              </div>
              </DialogContent>
            </Dialog>
            {onImportCollection && (
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Collection
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="w-4 h-4 mr-2" />
              Collections
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => onSelectCollection(collection)}
                className={activeCollection?.id === collection.id ? 'bg-accent' : ''}
              >
                {collection.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </DropdownMenuItem>
              </DialogTrigger>
            </Dialog>
            {activeCollection && onExportCollection && (
              <>
                <DropdownMenuItem onClick={() => onExportCollection(activeCollection)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Collection
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${activeCollection.name}"?`)) {
                      onDeleteCollection(activeCollection.id);
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Collection
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = handleImport;
                input.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Choose a template to create a new collection for tracking your hobbies.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Template</label>
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(presets).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button onClick={createCollection} className="w-full">
                  Create Collection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="border border-border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => onSelectCollection(collection)}
          >
            <h3 className="font-medium mb-2">{collection.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {collection.columns.reduce((total, col) => total + col.cards.length, 0)} items
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCollection(collection);
                }}
              >
                Open
              </Button>
              {onExportCollection && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportCollection(collection);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
                    onDeleteCollection(collection.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <div className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">New Collection</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Choose a template to create a new collection for tracking your hobbies.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Template</label>
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(presets).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button onClick={createCollection} className="w-full">
                  Create Collection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {onImportCollection && (
          <label className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Import Collection</p>
            </div>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        )}
      </div>
    </div>
  );
}