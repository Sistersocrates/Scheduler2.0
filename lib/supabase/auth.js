
// This file contains legacy authentication logic.
// It is being phased out in favor of AuthContext and authService.js.
// Avoid using functions from this file for new development.

import { supabase } from './client';
// The error handlers and validation functions previously imported here
// are now primarily used within the newer authService.js or directly in components
// where specific validation is needed.
// For example, emailValidation is specific and might be used in forms.
// Supabase error handlers are part of the global errorHandler.

console.warn("src/lib/supabase/auth.js is a legacy file and should ideally not be used. Prefer AuthContext and authService.js");

// Example of a function that might have existed here, now deprecated:
export const legacySignInWithGoogle = async (role) => {
  console.warn("legacySignInWithGoogle is deprecated. Use loginWithGoogle from AuthContext.");
  try {
    if (!role) {
      throw new Error('Role is required for sign in');
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          // hd: 'rochesterschools.org' // Domain restriction if needed
        },
      },
    });

    if (error) {
      console.error('Google sign in error in legacy auth.js:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Sign in error in legacy auth.js:', error);
    // Consider using the global handleError or a more specific one if this were active code
    throw new Error(`Legacy Google Sign-In Error: ${error.message}`);
  }
};

export const legacySignOut = async () => {
  console.warn("legacySignOut is deprecated. Use logout from AuthContext.");
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error in legacy auth.js:', error);
      throw error;
    }
    // Local storage clearing is now handled by AuthContext or its effects
  } catch (error) {
    console.error('Sign out error in legacy auth.js:', error);
    throw new Error(`Legacy Sign Out Error: ${error.message}`);
  }
};

// Other functions like validateUserData, checkUserSession, refreshSession, initializeAuth
// from the original file are now superseded by logic within AuthContext, authService.js,
// and the Supabase client's own capabilities.
// Retaining this file with warnings to indicate its deprecated status.
