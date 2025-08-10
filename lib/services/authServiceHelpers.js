
import { supabase } from '@/lib/supabase/client';
import { validateRochesterEmail } from '@/lib/utils/validation/emailValidation';
import { validateSupabaseAuth } from '@/lib/utils/errors/supabaseAuthErrors';
import { handleError } from '@/lib/utils/errorHandler';

export const getUserProfileFromDb = async (userId, roleName) => {
  if (!userId) {
    console.warn("getUserProfileFromDb: userId is missing.");
    return null;
  }

  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role_id,
        profile_image_url,
        status,
        tenant_id,
        roles ( name ) 
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') { // Not found
        console.warn(`User profile not found for ID: ${userId}. This might be a new user.`);
        return null; 
      }
      throw profileError;
    }
    
    if (!userProfile) {
        console.warn(`User profile not found for ID: ${userId}. This might be a new user.`);
        return null;
    }

    const profileWithRoleName = {
      ...userProfile,
      role: userProfile.roles?.name || roleName, 
    };
    
    delete profileWithRoleName.roles;
    delete profileWithRoleName.role_id;

    return profileWithRoleName;

  } catch (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    throw new Error(`User profile could not be retrieved: ${error.message}`);
  }
};


export const validateAndEnrichAuthUser = async (supabaseUser, selectedRoleName) => {
  if (!supabaseUser) throw new Error("Supabase user data is missing.");
  if (!supabaseUser.email) throw new Error("Supabase user email is missing.");
  
  validateRochesterEmail(supabaseUser.email);

  const userProfile = await getUserProfileFromDb(supabaseUser.id, selectedRoleName);

  if (!userProfile) {
    // This case should ideally be handled by the handle_new_user trigger.
    // If profile is still null, it might be a sync issue or the trigger hasn't run yet.
    // For robustness, we can attempt to create a basic user record here or rely on trigger.
    // For now, we'll log and proceed, assuming the trigger will eventually create it.
    console.warn(`Profile for user ${supabaseUser.id} not found. Awaiting trigger or manual creation.`);
    // Return a basic structure based on Supabase auth user if profile is missing
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      first_name: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || 'New',
      last_name: supabaseUser.user_metadata?.last_name || 'User',
      role: selectedRoleName || supabaseUser.user_metadata?.role || 'pending_role_assignment',
      profile_image_url: supabaseUser.user_metadata?.avatar_url,
      status: 'active', // Default status
      tenant_id: supabaseUser.user_metadata?.tenant_id, // Assuming tenant_id might be in metadata
      profile: null, // Explicitly indicate profile is missing
    };
  }
  
  // Ensure the role from the profile (which comes from DB `roles` table) is used if available
  // and matches the selectedRoleName if provided, otherwise, use profile's role.
  const finalRole = userProfile.role || selectedRoleName || 'unknown';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    app_metadata: supabaseUser.app_metadata,
    user_metadata: supabaseUser.user_metadata,
    aud: supabaseUser.aud,
    created_at: supabaseUser.created_at,
    role: finalRole, 
    profile: userProfile,
  };
};

export const processSupabaseUser = async (supabaseUser, selectedRoleName) => {
  if (!supabaseUser) throw new Error("No Supabase user provided to process.");
  
  const fullUserData = await validateAndEnrichAuthUser(supabaseUser, selectedRoleName);
  
  if (!fullUserData.profile) {
    console.warn(`User ${supabaseUser.id} processed but profile is still missing. Trigger might be pending.`);
    // Depending on strictness, could throw error here or allow login with minimal data
  }

  localStorage.setItem('user', JSON.stringify(fullUserData));
  if (selectedRoleName) localStorage.setItem('selectedRole', selectedRoleName);
  
  return fullUserData;
};


export const handleOAuthSignIn = async (selectedRoleName) => {
  if (!selectedRoleName) throw new Error('Role is required for sign in');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        hd: 'rochesterschools.org'
      },
      data: { 
        role: selectedRoleName 
      }
    },
  });

  if (error) throw error;
  return data;
};

export const handleUserSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  localStorage.removeItem('user');
  localStorage.removeItem('selectedRole');
};

export const handleSessionRefresh = async () => {
  const { data: { session: supabaseSession }, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) throw refreshError;
  if (!supabaseSession) throw new Error('Failed to refresh session');

  validateSupabaseAuth(supabaseSession);
  const fullUserData = await validateAndEnrichAuthUser(supabaseSession.user, supabaseSession.user.user_metadata?.role || null);
  localStorage.setItem('user', JSON.stringify(fullUserData));
  return fullUserData;
};

export const handleInitialAuthLoad = async () => {
  const { data: { session: supabaseSession } } = await supabase.auth.getSession();
  if (!supabaseSession) return null;
  
  const storedUserString = localStorage.getItem('user');
  let fullUserData;

  if (storedUserString) {
      try {
          const storedUser = JSON.parse(storedUserString);
          if (storedUser.id === supabaseSession.user.id && storedUser.profile) {
              fullUserData = await validateAndEnrichAuthUser(supabaseSession.user, storedUser.role || storedUser.profile?.role?.name);
          } else {
              localStorage.removeItem('user');
              fullUserData = await validateAndEnrichAuthUser(supabaseSession.user, supabaseSession.user.user_metadata?.role);
          }
      } catch (e) {
          localStorage.removeItem('user'); 
          fullUserData = await validateAndEnrichAuthUser(supabaseSession.user, supabaseSession.user.user_metadata?.role);
      }
  } else {
      fullUserData = await validateAndEnrichAuthUser(supabaseSession.user, supabaseSession.user.user_metadata?.role);
  }
  
  localStorage.setItem('user', JSON.stringify(fullUserData)); 
  return fullUserData;
};

export const handleSessionStateChange = async (event, session) => {
  let user = null;
  let error = null;

  try {
    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          const selectedRole = localStorage.getItem('selectedRole') || session.user.user_metadata?.role;
          user = await processSupabaseUser(session.user, selectedRole);
        } else {
          throw new Error("SIGNED_IN event but no session user data.");
        }
        break;
      case 'SIGNED_OUT':
        user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('selectedRole');
        break;
      case 'TOKEN_REFRESHED':
        if (session?.user) {
          user = await handleSessionRefresh();
        } else {
           await handleUserSignOut(); // If refresh fails, sign out
           throw new Error("TOKEN_REFRESHED event but no session user data.");
        }
        break;
      case 'USER_UPDATED':
        if (session?.user) {
          const currentRole = JSON.parse(localStorage.getItem('user'))?.role;
          user = await processSupabaseUser(session.user, currentRole);
        }
        break;
      case 'INITIAL_SESSION':
         if (session?.user) {
            user = await handleInitialAuthLoad();
         }
        break;
      default:
        // For other events, we might not need to change the user state immediately
        // or might want to log them.
        console.log(`Unhandled auth event: ${event}`);
    }
  } catch (err) {
    console.error(`Error handling auth event ${event}:`, err);
    error = handleError(err, `Auth Event: ${event}`);
    user = null; // Ensure user is null on error
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await handleUserSignOut(); // Force sign out if critical auth events fail
    }
  }
  return { user, error, event, session };
};
