import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Only log unexpected errors during initial session load
        if (!error.message.includes('Invalid Refresh Token') && 
            !error.message.includes('Refresh Token Not Found') &&
            !error.message.includes('refresh_token_not_found') &&
            !error.message.includes('Auth session missing')) {
          console.error('Error getting initial session:', error);
        }
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // If user signed out or session expired, ensure we're in a clean state
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      // Note: In production, you would need to verify email
      // For development/testing, this creates the account
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred during sign up' };
    }
  };

  const signOut = async () => {
    try {
      // Clear user state immediately to prevent UI glitches
      setUser(null);
      
      // Always attempt to sign out, but handle "session missing" gracefully
      const { error } = await supabase.auth.signOut();
      
      // Only log errors that aren't "session missing" since that's expected when already signed out
      if (error && !error.message.includes('Auth session missing')) {
        console.error('Sign out error:', error.message);
      }
      
      // Ensure clean state after sign out
      setTimeout(() => {
        setUser(null);
      }, 100);
      
    } catch (error: any) {
      // Silently handle "session missing" errors, log others
      if (!error?.message?.includes('Auth session missing')) {
        console.error('Unexpected sign out error:', error);
      }
      // Force clear user state even if sign out fails
      setUser(null);
    }
  };

  const validateSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // Only log unexpected session errors
        if (error && 
            !error.message.includes('Invalid Refresh Token') && 
            !error.message.includes('Refresh Token Not Found') &&
            !error.message.includes('refresh_token_not_found') &&
            !error.message.includes('Auth session missing')) {
          console.error('Unexpected session validation error:', error.message);
        }
        if (user) {
          setUser(null);
        }
        return false;
      }
      
      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        // Session expired - silently sign out
        await signOut();
        return false;
      }
      
      return true;
    } catch (error: any) {
      // Only log truly unexpected errors
      if (error?.message && 
          !error.message.includes('Invalid Refresh Token') && 
          !error.message.includes('Refresh Token Not Found') &&
          !error.message.includes('refresh_token_not_found')) {
        console.error('Error validating session:', error);
      }
      return false;
    }
  };

  const getAccessToken = async () => {
    try {
      // First, try to get the current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting current session:', sessionError.message);
        await signOut();
        return null;
      }
      
      if (!currentSession) {
        setUser(null);
        return null;
      }
      
      // Check if the session is close to expiring (refresh if expires in less than 5 minutes)
      const expiresAt = currentSession.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt ? (expiresAt - now) : 0;
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          // Only log unexpected refresh errors, not common ones like expired refresh tokens
          if (refreshError && 
              !refreshError.message.includes('Invalid Refresh Token') && 
              !refreshError.message.includes('Refresh Token Not Found') &&
              !refreshError.message.includes('refresh_token_not_found')) {
            console.error('Unexpected session refresh error:', refreshError.message);
          }
          // Gracefully sign out without logging expected refresh token errors
          await signOut();
          return null;
        }
        
        return refreshedSession.access_token;
      }
      
      return currentSession.access_token;
    } catch (error) {
      console.error('Error in getAccessToken:', error);
      await signOut();
      return null;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getAccessToken,
    validateSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}