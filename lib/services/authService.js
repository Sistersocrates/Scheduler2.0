
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

export const fetchUserProfile = async (userId) => {
  if (!userId) {
    console.warn("fetchUserProfile called with no userId");
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        role: roles!inner (id, name)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116: 0 rows, not necessarily a critical error for profile check, means profile doesn't exist yet.
      if (error.code === 'PGRST116') { 
        console.log(`User profile not found for id ${userId}. This might be a new user.`);
        return null;
      }
      throw error; // Other errors are critical
    }
    return data;
  } catch (error) {
    console.error(`fetchUserProfile error for user ${userId}:`, error);
    // Do not throw critical error here, allow AuthContext to handle missing profile
    return null; 
  }
};

export const createInitialUserProfile = async (authUser) => {
  if (!authUser || !authUser.id || !authUser.email) {
    console.error("createInitialUserProfile: Invalid authUser object provided.", authUser);
    return null;
  }
  try {
    const tenantIdFromMetadata = authUser.app_metadata?.tenant_id;
    let roleIdFromMetadata = authUser.app_metadata?.role_id;

    let finalTenantId = tenantIdFromMetadata;
    let finalRoleId = roleIdFromMetadata;

    // Fallback logic if tenant_id or role_id is missing from authUser metadata
    // This might happen if the Edge Function didn't set them, or for non-Google sign-ups
    if (!finalTenantId) {
      console.warn("Tenant ID missing in authUser metadata. Attempting to assign default tenant.");
      const { data: defaultTenant, error: tenantErr } = await supabase.from('tenants').select('id').eq('name', 'Default Tenant').single(); // Assuming a 'Default Tenant'
      if (tenantErr || !defaultTenant) {
        console.error("Default tenant 'Default Tenant' not found for profile creation.", tenantErr);
        throw new Error("Default tenant not found for profile creation.");
      }
      finalTenantId = defaultTenant.id;
    }

    if (!finalRoleId) {
      console.warn(`Role ID missing in authUser metadata for tenant ${finalTenantId}. Attempting to assign default 'student' role.`);
      const { data: defaultRole, error: roleErr } = await supabase.from('roles').select('id').eq('name', 'student').eq('tenant_id', finalTenantId).single();
      if (roleErr || !defaultRole) {
        console.error(`Default 'student' role not found for tenant ${finalTenantId}.`, roleErr);
        throw new Error(`Default student role not found for tenant ${finalTenantId}.`);
      }
      finalRoleId = defaultRole.id;
    }

    const userProfileData = {
      id: authUser.id, // This MUST match auth.users.id
      email: authUser.email,
      first_name: authUser.user_metadata?.first_name || authUser.email?.split('@')[0] || 'New',
      last_name: authUser.user_metadata?.last_name || 'User',
      profile_image_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
      role_id: finalRoleId, 
      tenant_id: finalTenantId, 
      status: 'active',
      google_id: authUser.app_metadata?.provider === 'google' ? authUser.id : null, // Assuming google_id is the same as authUser.id if provider is google
      // google_refresh_token should be handled server-side, not typically stored in public.users directly by client
    };

    const { data: newUserProfile, error: insertError } = await supabase
      .from('users')
      .insert(userProfileData)
      .select(`
        *,
        role: roles!inner (id, name)
      `)
      .single();

    if (insertError) {
        // If it's a unique constraint violation (23505), it means the profile might already exist (race condition or previous failed attempt)
        if (insertError.code === '23505') {
            console.warn(`Profile for user ${authUser.id} likely already exists. Attempting to fetch.`);
            return await fetchUserProfile(authUser.id);
        }
        throw insertError;
    }
    console.log(`Successfully created profile for user ${newUserProfile.id}`);
    return newUserProfile;
  } catch (error) {
    console.error(`createInitialUserProfile error for authUser ${authUser.id}:`, error);
    return null; 
  }
};


export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select(`
        *,
        role: roles!inner (id, name)
      `)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'updateUserProfile');
  }
};

// This function is not strictly necessary if AuthContext.user.role is kept up-to-date
export const checkUserRole = async (userId, expectedRole) => {
  try {
    const profile = await fetchUserProfile(userId);
    return profile && profile.role && profile.role.name === expectedRole;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
};

// These are wrappers around supabase.auth methods, already available via supabase client.
// Kept for potential future abstraction or if specific error handling/logging is added here.
export const getSupabaseUser = async () => {
    const { data: { user } , error} = await supabase.auth.getUser();
    if (error) {
        console.error("Error fetching supabase user:", error);
        return null;
    }
    return user;
};

export const getSupabaseSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
     if (error) {
        console.error("Error fetching supabase session:", error);
        return null;
    }
    return session;
};
