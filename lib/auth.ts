/**
 * Auth — Google OAuth via Supabase Auth
 * 
 * Users must sign in with Google to access agent request forms.
 * This gives us: email, name, avatar, and a trackable user ID.
 * 
 * No anonymous requests. Every interaction is tied to a real account.
 */

import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

/**
 * Sign in with Google OAuth
 * Redirects to Google, then back to the specified URL
 */
export async function signInWithGoogle(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current authenticated user (null if not signed in)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Unknown',
    avatar: user.user_metadata?.avatar_url || null,
  };
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || 'Unknown',
        avatar: session.user.user_metadata?.avatar_url || null,
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Get current session (for passing auth token to API routes)
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
