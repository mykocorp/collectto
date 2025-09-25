// Data versioning and migration utilities for Collectto
// This ensures user data is preserved during app updates

export const CURRENT_DATA_VERSION = "1.0.0";

export interface VersionedData {
  version: string;
  collections: any[];
  lastBackup?: string;
}

export interface MigrationResult {
  success: boolean;
  data: any[];
  warnings?: string[];
  needsBackup?: boolean;
}

// Check if data needs migration
export function needsMigration(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // If it's an array (old format), it needs migration
  if (Array.isArray(data)) return true;
  
  // If it has version info, check if it's current
  if (data.version) {
    return data.version !== CURRENT_DATA_VERSION;
  }
  
  return false;
}

// Migrate data from old format to current format
export function migrateData(data: any): MigrationResult {
  const warnings: string[] = [];
  
  try {
    // Handle array format (pre-versioning)
    if (Array.isArray(data)) {
      return {
        success: true,
        data: data,
        warnings: ["Migrated from legacy format"],
        needsBackup: true
      };
    }
    
    // Handle versioned data
    if (data.version) {
      switch (data.version) {
        case "1.0.0":
          return {
            success: true,
            data: data.collections || []
          };
        
        default:
          warnings.push(`Unknown version ${data.version}, attempting to use collections data`);
          return {
            success: true,
            data: data.collections || [],
            warnings,
            needsBackup: true
          };
      }
    }
    
    // Handle object without version (assume it's collections data)
    if (data.collections) {
      return {
        success: true,
        data: data.collections,
        warnings: ["Migrated unversioned data"],
        needsBackup: true
      };
    }
    
    // Fallback - treat as empty
    return {
      success: true,
      data: [],
      warnings: ["Could not migrate data, starting fresh"]
    };
    
  } catch (error) {
    console.error("Migration error:", error);
    return {
      success: false,
      data: [],
      warnings: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Create versioned data structure
export function createVersionedData(collections: any[]): VersionedData {
  return {
    version: CURRENT_DATA_VERSION,
    collections,
    lastBackup: new Date().toISOString()
  };
}

// Safely parse and migrate data
export function safeParseCollections(jsonString: string | null): MigrationResult {
  if (!jsonString) {
    return {
      success: true,
      data: []
    };
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return migrateData(parsed);
  } catch (error) {
    console.error("JSON parse error:", error);
    return {
      success: false,
      data: [],
      warnings: [`Failed to parse saved data: ${error instanceof Error ? error.message : 'Invalid JSON'}`]
    };
  }
}

// Create backup in localStorage
export function createLocalBackup(collections: any[], suffix: string = '') {
  try {
    const backupKey = `collectto-backup-${Date.now()}${suffix}`;
    const backupData = createVersionedData(collections);
    
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    // Clean up old backups (keep only last 5)
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys
      .filter(key => key.startsWith('collectto-backup-'))
      .sort()
      .reverse();
    
    // Remove old backups beyond the 5 most recent
    backupKeys.slice(5).forEach(key => {
      localStorage.removeItem(key);
    });
    
    return backupKey;
  } catch (error) {
    console.error("Backup creation failed:", error);
    return null;
  }
}

// Restore from backup
export function restoreFromBackup(backupKey: string): MigrationResult {
  try {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      return {
        success: false,
        data: [],
        warnings: ["Backup not found"]
      };
    }
    
    return safeParseCollections(backupData);
  } catch (error) {
    console.error("Backup restore failed:", error);
    return {
      success: false,
      data: [],
      warnings: [`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// List available backups
export function listBackups(): string[] {
  const allKeys = Object.keys(localStorage);
  return allKeys
    .filter(key => key.startsWith('collectto-backup-'))
    .sort()
    .reverse();
}