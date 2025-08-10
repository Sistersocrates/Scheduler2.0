
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import { handleError } from '@/lib/utils/errorHandler';
import { fetchUserProfile, createInitialUserProfile } from '@/lib/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const processUserSession = useCallback(async (supabaseSession) => {
    setLoading(true);
    if (supabaseSession?.user) {
      try {
        let userProfile = await fetchUserProfile(supabaseSession.user.id);
        
        if (!userProfile) {
          console.log(`No profile found for ${supabaseSession.user.id}, attempting to create one.`);
          userProfile = await createInitialUserProfile(supabaseSession.user);
        }
        
        if (userProfile) {
          const fullUser = {
            ...supabaseSession.user, // Raw Supabase auth user data
            ...userProfile,          // Data from public.users table
            role: userProfile.role?.name || 'pending_role', // Ensure role name is used
            tenant_id: userProfile.tenant_id,
          };
          setUser(fullUser);
          setSession(supabaseSession);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(fullUser)); // Persist enriched user
        } else {
          console.error("User profile could not be fetched or created for:", supabaseSession.user.id);
          await supabase.auth.signOut(); // Sign out if profile is essential and missing
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error("Error processing user session:", error);
        // Potentially sign out if there's a critical error processing session
        // await supabase.auth.signOut(); 
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);


  useEffect(() => {
    const getActiveSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      await processUserSession(activeSession);
      setLoading(false); // Ensure loading is false after initial check
    };
    
    getActiveSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log(`Auth event in AuthContext: ${_event}`, newSession ? { user_id: newSession.user?.id } : {});
      await processUserSession(newSession);
      
      if (_event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
      // SIGNED_IN navigation is typically handled by the component that initiated login
      // or by NavigateToDashboard component after state update.
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate, processUserSession]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange will trigger processUserSession
      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error: handleError(error, 'login') };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (authCode, redirectUri) => {
    setLoading(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('google-auth-callback', {
        body: { code: authCode, redirectUri: redirectUri },
      });

      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);
      
      if (data.session && data.session.access_token && data.session.user) {
        await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token || '',
        });
        // onAuthStateChange will trigger processUserSession with the new session
        // To be absolutely sure, we can fetch it again, but onAuthStateChange should suffice
        const { data: { session: activeSessionAfterGoogle } } = await supabase.auth.getSession();
        // processUserSession will be called by onAuthStateChange, but calling it here ensures immediate update if needed
        await processUserSession(activeSessionAfterGoogle); 
        return { session: activeSessionAfterGoogle, error: null };
      } else {
        throw new Error("Google login function did not return a valid session.");
      }
    } catch (error) {
      console.error("Google login error in AuthContext:", error);
      return { session: null, error: handleError(error, 'loginWithGoogle') };
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // onAuthStateChange will set user/session to null and navigate
      return { error: null };
    } catch (error) {
      return { error: handleError(error, 'logout') };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    isAuthenticated,
    loading,
    login,
    loginWithGoogle,
    logout,
    refreshSession: useCallback(async () => { // Allow manual refresh if needed
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        await processUserSession(activeSession);
    }, [processUserSession]),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
