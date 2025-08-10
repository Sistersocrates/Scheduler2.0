
import { supabase } from '@/lib/supabase/client';
import { 
  handleSupabaseLoginError, 
  validateSupabaseLoginData as validateExternalLoginData 
} from '@/lib/utils/errors/supabaseLoginErrors';
import { validateRochesterEmail } from '@/lib/utils/validation/emailValidation';
import { handleError } from '@/lib/utils/errorHandler';

export const getUserProfileFromDb = async (authUserId) => {
  if (!authUserId) throw new Error('Auth User ID is required to fetch profile.');
  try {
    const { data: userProfile, error } = await supabase
      .from('users')
      .select(`
        id,
        auth_user_id,
        tenant_id,
        email,
        first_name,
        last_name,
        profile_image_url,
        status,
        role:roles(id, name),
        tenant:tenants(id, name, domain)
      `)
      .eq('auth_user_id', authUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        return null; 
      }
      throw error;
    }
    return userProfile;
  } catch (err) {
    console.error('Error fetching user profile from DB:', err);
    throw new Error(handleError(err, 'getUserProfileFromDb'));
  }
};

export const validateAndEnrichAuthUser = async (authUserData, selectedRoleName) => {
  try {
    if (!authUserData || !authUserData.id || !authUserData.email) {
      throw new Error('Invalid Supabase authentication data provided.');
    }
    validateRochesterEmail(authUserData.email);

    const externalData = {
      email: authUserData.email,
      name: authUserData.user_metadata?.full_name || authUserData.user_metadata?.name || 'N/A',
      sub: authUserData.id, 
      role: selectedRoleName, 
    };
    validateExternalLoginData(externalData); 

    let userProfile = await getUserProfileFromDb(authUserData.id);

    if (!userProfile) {
      console.warn(`User profile in public.users not found for auth_user_id ${authUserData.id}. The handle_new_user trigger should create this.`);
      // Potentially wait and retry, or rely on trigger. For now, error if not found after short delay.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Give trigger a bit more time
      userProfile = await getUserProfileFromDb(authUserData.id);
      if (!userProfile) {
        // This indicates a problem with the user creation flow (e.g. trigger failed)
        // The trigger is responsible for creating the entry in public.users
        throw new Error('User profile could not be retrieved. Please ensure the `handle_new_user` trigger is functioning correctly.');
      }
    }
    
    // The trigger `handle_new_user` should set the role based on user_metadata.
    // If `selectedRoleName` from UI differs (e.g. user selected different role than one in metadata),
    // this part ensures the `public.users.role_id` is updated to match the selection.
    if (selectedRoleName && userProfile.role?.name !== selectedRoleName) {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', selectedRoleName)
        .single();
      if (roleError || !roleData) {
        throw new Error(`Invalid role specified or not found in database: ${selectedRoleName}`);
      }
      const { error: updateError } = await supabase
        .from('users')
        .update({ role_id: roleData.id, updated_at: new Date().toISOString() })
        .eq('auth_user_id', authUserData.id); // Ensure we update the correct user
      if (updateError) {
        console.error("Error updating user role:", updateError);
        throw new Error(`Failed to update user role to ${selectedRoleName}.`);
      }
      userProfile = await getUserProfileFromDb(authUserData.id); // Re-fetch profile
    }

    return {
      id: authUserData.id, // This is supabase.auth.user.id
      app_metadata: authUserData.app_metadata,
      user_metadata: authUserData.user_metadata,
      aud: authUserData.aud,
      created_at: authUserData.created_at,
      // Include actual profile data from public.users table
      profile: userProfile,
      // Standardize role and tenant access
      email: userProfile?.email || authUserData.email, // Prefer profile email
      role: userProfile?.role?.name || selectedRoleName, 
      tenant: userProfile?.tenant 
    };

  } catch (error) {
    console.error('User data validation/enrichment error:', error);
    // Provide more context if it's a known login error type
    if (error.message.includes("profile") || error.message.includes("role")) {
         throw new Error(handleSupabaseLoginError({ message: error.message }, 'validateAndEnrichAuthUser'));
    }
    throw new Error(handleError(error, 'validateAndEnrichAuthUser'));
  }
};

// Alias for clarity in AuthContext/authService
export const processSupabaseUser = validateAndEnrichAuthUser;

