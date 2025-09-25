// Environment-based configuration for Supabase
const getEnvVar = (key: string, fallback: string): string => {
  try {
    return import.meta?.env?.[key] || fallback;
  } catch (error) {
    return fallback;
  }
};

export const projectId = getEnvVar("VITE_SUPABASE_PROJECT_ID", "wkgfpecnaibxtuehebpo");
export const publicAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZ2ZwZWNuYWlieHR1ZWhlYnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjU3NjAsImV4cCI6MjA3MjkwMTc2MH0.WlPhRUneUYYucjOx0BUyXLuBWhtQFL94coXtQF4QIu0");