import { useState, useEffect } from "react";
import { Board } from "../components/Board";
import { CollectionManager } from "../components/CollectionManager";
import { ThemeToggle } from "../components/ThemeToggle";
import { DenseToggle } from "../components/DenseToggle";
import { AboutModal } from "../components/AboutModal";
import { AuthProvider, useAuth } from "../components/auth/AuthContext";
import { ProfileMenu } from "../components/auth/ProfileMenu";
import { ShareButton } from "../components/sharing/ShareButton";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { SharedCollectionWrapper } from "../components/SharedCollectionWrapper";
import { EmailConfirmation } from "../components/auth/EmailConfirmation";
import { Router } from "../components/Router";
import { Input } from "../components/ui/input";
import { Toaster } from "../components/ui/sonner";
import { FloatingHelpButton } from "../components/FloatingHelpButton";
import { 
  safeParseCollections, 
  createVersionedData, 
  createLocalBackup,
  CURRENT_DATA_VERSION 
} from "../utils/dataVersion";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export interface Card {
  id: string;
  title: string;
  description: string;
  links: string[];
  tags: string[];
  rating?: number;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  rate: boolean;
  color?: string;
}

export interface Collection {
  id: string;
  name: string;
  columns: Column[];
  preset: string;
}

const COLLECTION_PRESETS = {
  blank: {
    name: "Blank Template",
    columns: [
      {
        id: "col1",
        title: "To Do",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col2",
        title: "In Progress",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col3",
        title: "Review",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col4",
        title: "Done",
        cards: [],
        rate: true,
        color: "",
      },
      {
        id: "col5",
        title: "Archive",
        cards: [],
        rate: false,
        color: "",
      },
    ],
  },
  movies: {
    name: "Movies",
    columns: [
      {
        id: "col1",
        title: "Wishlisted",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col2",
        title: "Planned",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col3",
        title: "Watching",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col4",
        title: "Abandoned",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col5",
        title: "Rated",
        cards: [],
        rate: true,
        color: "",
      },
    ],
  },
  games: {
    name: "Videogames",
    columns: [
      {
        id: "col1",
        title: "Not started",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col2",
        title: "Playing",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col3",
        title: "On hold",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col4",
        title: "Completed",
        cards: [],
        rate: true,
        color: "",
      },
    ],
  },
  books: {
    name: "Books",
    columns: [
      {
        id: "col1",
        title: "To Read",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col2",
        title: "Reading",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col3",
        title: "Paused",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col4",
        title: "Finished",
        cards: [],
        rate: true,
        color: "",
      },
    ],
  },
  tv: {
    name: "TV Series",
    columns: [
      {
        id: "col1",
        title: "Watchlist",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col2",
        title: "Watching",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col3",
        title: "On Hold",
        cards: [],
        rate: false,
        color: "",
      },
      {
        id: "col4",
        title: "Completed",
        cards: [],
        rate: true,
        color: "",
      },
    ],
  },
};

function MainApp() {
  const { user, getAccessToken, validateSession } = useAuth();
  const [collections, setCollections] = useState<Collection[]>(
    [],
  );
  const [activeCollection, setActiveCollection] =
    useState<Collection | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "oryso">("dark");
  const [dense, setDense] = useState<boolean>(false);
  const [isEditingCollectionName, setIsEditingCollectionName] =
    useState(false);
  const [editedCollectionName, setEditedCollectionName] =
    useState("");
  const [sharedCollections, setSharedCollections] = useState<Set<string>>(new Set());
  const [collectionsLoaded, setCollectionsLoaded] = useState(false);

  // Load collections based on auth state
  useEffect(() => {
    const initializeCollections = async () => {
      if (user) {
        // User is authenticated - validate session first, then load from server
        const isValid = await validateSession();
        if (isValid) {
          // Always preserve active collection unless it's the very first load
          await loadUserCollections(collectionsLoaded);
        } else {
          // Session is invalid, clear state and load local data
          setCollections([]);
          setActiveCollection(null);
          setSharedCollections(new Set());
          loadLocalCollections();
        }
      } else {
        // User is not authenticated - clear server-related state and load local data
        setSharedCollections(new Set());
        loadLocalCollections();
      }
    };

    initializeCollections();
  }, [user]);

  // Load theme preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "collectto-theme",
    ) as "light" | "dark" | "oryso" | null;
    const savedDense =
      localStorage.getItem("collectto-dense") === "true";

    if (savedTheme) {
      setTheme(savedTheme);
    }
    setDense(savedDense);
  }, []);

  const loadUserCollections = async (preserveActiveCollection = false) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setCollections([]);
        setActiveCollection(null);
        setCollectionsLoaded(true);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d942fc1/user/collections`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const serverCollections = data.collections || [];
        
        // Create backup before updating if we have existing collections
        if (collections.length > 0 && serverCollections.length > 0) {
          createLocalBackup(collections, '-pre-server-sync');
        }

        setCollections(serverCollections);
        
        // Enhanced active collection preservation logic
        if (serverCollections.length > 0) {
          if (!preserveActiveCollection || !activeCollection) {
            setActiveCollection(serverCollections[0]);
          } else {
            // Try to find the currently active collection by ID first
            const currentActiveId = activeCollection.id;
            let foundActiveCollection = serverCollections.find((col: Collection) => col.id === currentActiveId);
            
            // If not found by ID, try to match by name (in case of ID changes)
            if (!foundActiveCollection && activeCollection.name) {
              foundActiveCollection = serverCollections.find((col: Collection) => 
                col.name === activeCollection.name && col.preset === activeCollection.preset
              );
            }
            
            if (foundActiveCollection) {
              // Update the active collection with the latest data while preserving the selection
              setActiveCollection(foundActiveCollection);
            } else {
              // Current active collection no longer exists, try to find best match
              const samePreset = serverCollections.find((col: Collection) => col.preset === activeCollection.preset);
              setActiveCollection(samePreset || serverCollections[0]);
            }
          }
        } else {
          setActiveCollection(null);
        }
      } else if (response.status === 401) {
        // Token expired - validate session which will handle logout if needed
        try {
          const isValid = await validateSession();
          if (!isValid) {
            // Session invalid - fall back to local collections
            setCollections([]);
            setActiveCollection(null);
          } else {
            // Session refreshed, retry loading with preserved collection
            await loadUserCollections(true);
            return; // Exit early to avoid setting collectionsLoaded twice
          }
        } catch (error) {
          // If validation fails, fall back gracefully
          setCollections([]);
          setActiveCollection(null);
        }
      } else {
        console.error('Failed to load collections:', response.status);
        // Don't clear collections on network errors - preserve what we have
        if (collections.length === 0) {
          setCollections([]);
          setActiveCollection(null);
        }
      }
    } catch (error) {
      console.error('Network error loading user collections:', error);
      // Don't clear collections on network errors - preserve what we have
      if (collections.length === 0) {
        setCollections([]);
        setActiveCollection(null);
      }
    } finally {
      setCollectionsLoaded(true);
    }
  };

  const loadLocalCollections = () => {
    const savedCollections = localStorage.getItem("collectto-collections");
    const migrationResult = safeParseCollections(savedCollections);
    
    if (migrationResult.success) {
      // Log any migration warnings
      migrationResult.warnings?.forEach(warning => {
        console.warn("Data migration:", warning);
      });
      
      // Create backup if migration occurred
      if (migrationResult.needsBackup && migrationResult.data.length > 0) {
        createLocalBackup(migrationResult.data, '-migration');
        console.log("Created migration backup for local collections");
      }
      
      setCollections(migrationResult.data);
      if (migrationResult.data.length > 0) {
        setActiveCollection(migrationResult.data[0]);
      } else {
        setActiveCollection(null);
      }
    } else {
      console.error("Failed to load local collections:", migrationResult.warnings);
      // Try to restore from most recent backup
      const backups = Object.keys(localStorage)
        .filter(key => key.startsWith('collectto-backup-'))
        .sort()
        .reverse();
      
      if (backups.length > 0) {
        console.log("Attempting to restore from backup:", backups[0]);
        const backupResult = safeParseCollections(localStorage.getItem(backups[0]));
        if (backupResult.success) {
          setCollections(backupResult.data);
          if (backupResult.data.length > 0) {
            setActiveCollection(backupResult.data[0]);
          }
        } else {
          setCollections([]);
          setActiveCollection(null);
        }
      } else {
        setCollections([]);
        setActiveCollection(null);
      }
    }
    setCollectionsLoaded(true);
  };

  const saveUserCollections = async (collections: Collection[]) => {
    if (!user) return;

    try {
      const token = await getAccessToken();
      if (!token) {
        return;
      }
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d942fc1/user/collections`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ collections })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired - validate session which will handle logout if needed
          try {
            const isValid = await validateSession();
            if (isValid) {
              // Session refreshed, retry the save operation
              await saveUserCollections(collections);
            }
            // If not valid, user will be signed out and data will be saved locally instead
          } catch (error) {
            // If validation fails, just continue - the useEffect will handle local saving
            console.debug('Auth validation failed during save, will fall back to local storage');
          }
        } else {
          console.error('Failed to save collections:', response.status);
        }
      }
    } catch (error) {
      console.error('Network error saving user collections:', error);
    }
  };

  // Apply theme and dense mode to document
  useEffect(() => {
    document.documentElement.className =
      `${theme} ${dense ? "dense" : ""}`.trim();
    localStorage.setItem("collectto-theme", theme);
  }, [theme, dense]);

  // Save dense preference
  useEffect(() => {
    localStorage.setItem("collectto-dense", dense.toString());
  }, [dense]);

  // Save collections based on auth state
  useEffect(() => {
    if (!collectionsLoaded) return; // Don't save during initial load
    
    if (user) {
      // Save to server for authenticated users
      if (collections.length > 0) {
        saveUserCollections(collections);
      }
    } else {
      // Save to localStorage for non-authenticated users using versioned format
      if (collections.length > 0) {
        const versionedData = createVersionedData(collections);
        localStorage.setItem(
          "collectto-collections",
          JSON.stringify(versionedData),
        );
        
        // Create periodic backup every 10 saves (rough estimate)
        if (Math.random() < 0.1) {
          createLocalBackup(collections, '-auto');
        }
      }
    }
  }, [collections, user, collectionsLoaded]);

  const createCollection = (presetKey: string): Collection => {
    const preset =
      COLLECTION_PRESETS[
        presetKey as keyof typeof COLLECTION_PRESETS
      ];
    return {
      id: Date.now().toString(),
      name: preset.name,
      columns: preset.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
        rate: col.rate,
        color: col.color || "",
      })),
      preset: presetKey,
    };
  };

  const addCollection = (presetKey: string) => {
    const newCollection = createCollection(presetKey);
    setCollections((prev) => [...prev, newCollection]);
    setActiveCollection(newCollection);
  };

  const updateCollection = (updatedCollection: Collection) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === updatedCollection.id
          ? updatedCollection
          : col,
      ),
    );
    setActiveCollection(updatedCollection);
  };

  const deleteCollection = (collectionId: string) => {
    setCollections((prev) => {
      const filtered = prev.filter(
        (col) => col.id !== collectionId,
      );
      if (activeCollection?.id === collectionId) {
        setActiveCollection(
          filtered.length > 0 ? filtered[0] : null,
        );
      }
      return filtered;
    });
  };

  const exportCollection = (collection: Collection) => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(dataStr);

    const exportFileDefaultName = `${collection.name.toLowerCase().replace(/\s+/g, "-")}-collection.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importCollection = (collection: Collection) => {
    // Check if a collection with the same name already exists
    const existingCollection = collections.find(
      (col) => col.name === collection.name,
    );

    if (existingCollection) {
      // Add a suffix to make the name unique
      const timestamp = new Date().toLocaleDateString();
      collection.name = `${collection.name} (imported ${timestamp})`;
    }

    // Add the imported collection
    setCollections((prev) => [...prev, collection]);
    setActiveCollection(collection);
  };

  const updateCollectionName = (newName: string) => {
    if (!activeCollection || !newName.trim()) return;

    const updatedCollection = {
      ...activeCollection,
      name: newName.trim(),
    };

    updateCollection(updatedCollection);
  };

  const startEditingCollectionName = () => {
    if (activeCollection) {
      setEditedCollectionName(activeCollection.name);
      setIsEditingCollectionName(true);
    }
  };

  const saveCollectionName = () => {
    updateCollectionName(editedCollectionName);
    setIsEditingCollectionName(false);
  };

  const cancelEditingCollectionName = () => {
    setIsEditingCollectionName(false);
    setEditedCollectionName("");
  };

  const handleShareStatusChange = (isShared: boolean, shareId?: string) => {
    if (activeCollection) {
      setSharedCollections(prev => {
        const newSet = new Set(prev);
        if (isShared && shareId) {
          newSet.add(activeCollection.id);
        } else {
          newSet.delete(activeCollection.id);
        }
        return newSet;
      });
    }
  };

  if (!activeCollection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <AboutModal>
            <h1 className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">
              Collec<i className="!italic">tt</i>o
            </h1>
          </AboutModal>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onThemeChange={setTheme} />
            <ProfileMenu theme={theme} onThemeChange={setTheme} />
          </div>
        </div>
        <CollectionManager
          collections={collections}
          onAddCollection={addCollection}
          onSelectCollection={setActiveCollection}
          onDeleteCollection={deleteCollection}
          onImportCollection={importCollection}
          presets={COLLECTION_PRESETS}
        />
        <FloatingHelpButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div
        className={`flex items-center justify-between border-b border-border ${dense ? "p-2" : "p-4"}`}
      >
        <div
          className={`flex items-center ${dense ? "gap-2" : "gap-4"}`}
        >
          <AboutModal>
            <h1 className="text-xl font-extrabold cursor-pointer hover:text-primary transition-colors">
              Collec<i className="!italic">tt</i>o
            </h1>
          </AboutModal>
          <span className="text-muted-foreground">/</span>
          {isEditingCollectionName ? (
            <Input
              value={editedCollectionName}
              onChange={(e) =>
                setEditedCollectionName(e.target.value)
              }
              className="text-lg h-auto py-1 px-2 min-w-[200px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveCollectionName();
                } else if (e.key === "Escape") {
                  cancelEditingCollectionName();
                }
              }}
              onBlur={saveCollectionName}
              autoFocus
            />
          ) : (
            <h2
              className="text-lg cursor-pointer hover:text-primary transition-colors"
              onClick={startEditingCollectionName}
              title="Click to edit collection name"
            >
              {activeCollection.name}
              {sharedCollections.has(activeCollection.id) && (
                <span className="ml-2 text-xs text-muted-foreground">*</span>
              )}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ShareButton 
            collection={activeCollection}
            onShareStatusChange={handleShareStatusChange}
          />
          <CollectionManager
            collections={collections}
            activeCollection={activeCollection}
            onAddCollection={addCollection}
            onSelectCollection={setActiveCollection}
            onDeleteCollection={deleteCollection}
            onExportCollection={exportCollection}
            onImportCollection={importCollection}
            presets={COLLECTION_PRESETS}
            compact
          />
          <DenseToggle
            dense={dense}
            onDenseChange={setDense}
          />
          <ThemeToggle
            theme={theme}
            onThemeChange={setTheme}
          />
          <ProfileMenu theme={theme} onThemeChange={setTheme} />
        </div>
      </div>
      <Board
        collection={activeCollection}
        onUpdateCollection={updateCollection}
        dense={dense}
      />
      <FloatingHelpButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <Router
          routes={[
            { path: '/shared/:shareId', component: SharedCollectionWrapper },
            { path: '/auth/confirm', component: EmailConfirmation },
            { path: '/', component: MainApp },
          ]}
        />
        <Toaster />
      </DndProvider>
    </AuthProvider>
  );
}