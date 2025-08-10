
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ydagmubnyruciwwbjxvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYWdtdWJueXJ1Y2l3d2JqeHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzE5MTIsImV4cCI6MjA2MTM0NzkxMn0.3t2T9eTCQPeTb2n2V3AJ_RWNQCRe4lhkC780J_HlG6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, 
    storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Use localStorage only in browser
    storageKey: 'supabase.auth.token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// Centralized Auth State Change Listener is primarily handled within AuthContext now
// to ensure React state updates correctly.
// However, logging events here can still be useful for debugging.
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Supabase auth event from client.js: ${event}`, session ? { user_id: session.user?.id, event: event } : { event: event });
  // Specific localStorage manipulations here can conflict with AuthContext's state management.
  // It's generally better to let AuthContext manage user state and localStorage based on these events.
});

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current Supabase auth user:', error.message);
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting current Supabase session:', error.message);
    return null;
  }
};
