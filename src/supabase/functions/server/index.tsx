import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize Supabase client with anon key for user validation
const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0d942fc1/health", (c) => {
  return c.json({ status: "ok" });
});

// Note: Using Supabase's built-in auth instead of custom endpoints

// Share collection endpoint
app.post("/make-server-0d942fc1/share", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Authorization required" }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { collection } = await c.req.json();
    if (!collection) {
      return c.json({ error: "Collection data is required" }, 400);
    }

    const shareId = crypto.randomUUID();
    const shareKey = `share:${shareId}`;
    
    const shareData = {
      id: shareId,
      collection,
      userId: user.id,
      createdAt: new Date().toISOString(),
      isPublic: true
    };

    await kv.set(shareKey, shareData);
    console.log("Created share for collection:", collection.name);

    return c.json({ shareId, shareUrl: `#/shared/${shareId}` });
  } catch (error) {
    console.log("Share error:", error);
    return c.json({ error: "Internal server error during share" }, 500);
  }
});

// Unshare collection endpoint
app.delete("/make-server-0d942fc1/share/:shareId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Authorization required" }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const shareId = c.req.param('shareId');
    const shareKey = `share:${shareId}`;
    
    const shareData = await kv.get(shareKey);
    if (!shareData) {
      return c.json({ error: "Share not found" }, 404);
    }

    if (shareData.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await kv.del(shareKey);

    return c.json({ success: true });
  } catch (error) {
    console.log("Unshare error:", error);
    return c.json({ error: "Internal server error during unshare" }, 500);
  }
});

// Get shared collection endpoint (public)
app.get("/make-server-0d942fc1/shared/:shareId", async (c) => {
  try {
    const shareId = c.req.param('shareId');
    
    if (!shareId || shareId.trim().length === 0) {
      return c.json({ error: "Invalid share ID" }, 400);
    }
    
    const shareKey = `share:${shareId.trim()}`;
    const shareData = await kv.get(shareKey);
    
    if (!shareData) {
      return c.json({ error: "Shared collection not found" }, 404);
    }
    
    if (!shareData.isPublic) {
      return c.json({ error: "Shared collection is not public" }, 404);
    }
    
    if (!shareData.collection) {
      return c.json({ error: "Shared collection data is corrupted" }, 404);
    }

    console.log("Serving shared collection:", shareData.collection.name);
    return c.json({ collection: shareData.collection });
  } catch (error) {
    console.log("Get shared collection error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user's shared collections
app.get("/make-server-0d942fc1/user/shares", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Authorization required" }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const shares = await kv.getByPrefix('share:');
    const userShares = shares
      .filter(share => share.userId === user.id && share.isPublic)
      .map(share => ({
        shareId: share.id,
        collectionId: share.collection.id,
        collectionName: share.collection.name,
        createdAt: share.createdAt
      }));

    return c.json({ shares: userShares });
  } catch (error) {
    console.log("Get user shares error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Save user collections
app.post("/make-server-0d942fc1/user/collections", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log("Save collections: No authorization token provided");
      return c.json({ error: "Authorization required" }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log("Save collections: Auth failed -", authError?.message || "No user ID");
      return c.json({ 
        error: "Unauthorized", 
        details: authError?.message || "Invalid or expired token"
      }, 401);
    }

    const { collections } = await c.req.json();
    if (!collections || !Array.isArray(collections)) {
      return c.json({ error: "Collections data is required" }, 400);
    }

    const userCollectionsKey = `user:${user.id}:collections`;
    
    // Create backup of existing data before overwriting
    const existingData = await kv.get(userCollectionsKey);
    if (existingData && existingData.collections && existingData.collections.length > 0) {
      const backupKey = `user:${user.id}:collections:backup:${Date.now()}`;
      await kv.set(backupKey, {
        ...existingData,
        backupCreatedAt: new Date().toISOString(),
        version: "1.0.0"
      });
      
      // Clean up old backups (keep only last 5)
      const allBackups = await kv.getByPrefix(`user:${user.id}:collections:backup:`);
      const sortedBackups = allBackups
        .sort((a, b) => b.backupCreatedAt?.localeCompare(a.backupCreatedAt || '') || 0)
        .slice(5); // Keep everything beyond the first 5 (which are the 5 most recent)
      
      for (const oldBackup of sortedBackups) {
        const oldBackupKey = `user:${user.id}:collections:backup:${oldBackup.backupCreatedAt}`;
        await kv.del(oldBackupKey);
      }
    }

    // Save new data with versioning
    await kv.set(userCollectionsKey, {
      userId: user.id,
      collections,
      updatedAt: new Date().toISOString(),
      version: "1.0.0"
    });

    return c.json({ success: true });
  } catch (error) {
    console.log("Save collections error:", error);
    return c.json({ error: "Internal server error during save" }, 500);
  }
});

// Get user collections
app.get("/make-server-0d942fc1/user/collections", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log("Get collections: No authorization token provided");
      return c.json({ error: "Authorization required" }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log("Get collections: Auth failed -", authError?.message || "No user ID");
      return c.json({ 
        error: "Unauthorized", 
        details: authError?.message || "Invalid or expired token"
      }, 401);
    }

    const userCollectionsKey = `user:${user.id}:collections`;
    const userData = await kv.get(userCollectionsKey);

    if (!userData || !userData.collections) {
      return c.json({ collections: [] });
    }

    // Handle potential data corruption or migration needs
    if (!Array.isArray(userData.collections)) {
      console.log("Collections data is corrupted for user:", user.id);
      
      // Try to restore from most recent backup
      const backups = await kv.getByPrefix(`user:${user.id}:collections:backup:`);
      if (backups.length > 0) {
        const mostRecentBackup = backups
          .sort((a, b) => b.backupCreatedAt?.localeCompare(a.backupCreatedAt || '') || 0)[0];
        
        if (mostRecentBackup && Array.isArray(mostRecentBackup.collections)) {
          console.log("Restored collections from backup for user:", user.id);
          return c.json({ 
            collections: mostRecentBackup.collections,
            restored: true 
          });
        }
      }
      
      return c.json({ collections: [] });
    }

    return c.json({ 
      collections: userData.collections,
      version: userData.version || "legacy"
    });
  } catch (error) {
    console.log("Get collections error:", error);
    return c.json({ error: "Internal server error during load" }, 500);
  }
});

Deno.serve(app.fetch);