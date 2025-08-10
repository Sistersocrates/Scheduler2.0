
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

export const fetchAllUsers = async (tenantId, { role, status, search, page = 1, limit = 20 } = {}) => {
  try {
    let query = supabase
      .from('users')
      .select(`
        id, 
        email, 
        first_name,
        last_name,
        profile_image_url,
        status,
        created_at,
        role: roles!inner (id, name)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId);

    if (role) {
      const { data: roleData, error: roleError } = await supabase.from('roles').select('id').eq('name', role).single();
      if (roleError) console.warn(`Role not found for name: ${role}`);
      if (roleData) query = query.eq('role_id', roleData.id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { users: data, count };
  } catch (error) {
    throw handleError(error, 'fetchAllUsers');
  }
};

export const fetchUserByIdAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        first_name,
        last_name,
        profile_image_url,
        status,
        role_id,
        tenant_id,
        role: roles (id, name)
      `)
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'fetchUserByIdAdmin');
  }
};

export const createNewUserAdmin = async (userData) => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password, 
      email_confirm: true, 
      user_metadata: { 
          first_name: userData.first_name, 
          last_name: userData.last_name,
      },
      app_metadata: {
          role_id: userData.role_id, // Ensure this corresponds to an ID in your roles table
          tenant_id: userData.tenant_id,
      }
    });

    if (authError) throw authError;
    
    const publicUserData = {
      id: authUser.user.id,
      tenant_id: userData.tenant_id,
      role_id: userData.role_id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      status: userData.status || 'invited', 
    };

    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .insert(publicUserData)
      .select()
      .single();

    if (publicUserError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw publicUserError;
    }
    
    return publicUser;
  } catch (error) {
    throw handleError(error, 'createNewUserAdmin');
  }
};

export const updateUserAdmin = async (userId, updates) => {
  try {
    const authUpdates = {};
    if (updates.email) authUpdates.email = updates.email;
    if (updates.password) authUpdates.password = updates.password; 
    
    const userMetadataUpdates = {};
    if (updates.first_name) userMetadataUpdates.first_name = updates.first_name;
    if (updates.last_name) userMetadataUpdates.last_name = updates.last_name;

    const appMetadataUpdates = {};
    // role_id is handled by updateUserRoleAdmin now
    // if (updates.role_id) appMetadataUpdates.role_id = updates.role_id;


    if (Object.keys(userMetadataUpdates).length > 0) authUpdates.user_metadata = userMetadataUpdates;
    if (Object.keys(appMetadataUpdates).length > 0) authUpdates.app_metadata = appMetadataUpdates;


    if (Object.keys(authUpdates).length > 0) {
      const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
      if (authError) throw authError;
    }
    
    const publicUserUpdates = {};
    if (updates.first_name) publicUserUpdates.first_name = updates.first_name;
    if (updates.last_name) publicUserUpdates.last_name = updates.last_name;
    if (updates.email) publicUserUpdates.email = updates.email;
    // role_id is handled by updateUserRoleAdmin
    if (updates.status) publicUserUpdates.status = updates.status;
    if (updates.profile_image_url) publicUserUpdates.profile_image_url = updates.profile_image_url;

    if (Object.keys(publicUserUpdates).length > 0) {
        const { data, error } = await supabase
        .from('users')
        .update(publicUserUpdates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    // If only role was updated, it's handled by updateUserRoleAdmin, so this function might return no specific user data here.
    // If no public user data fields were updated, it means only auth data or role was changed.
    const { data: updatedUser, error: fetchError } = await fetchUserByIdAdmin(userId);
    if (fetchError) throw fetchError;
    return updatedUser;

  } catch (error) {
    throw handleError(error, 'updateUserAdmin');
  }
};

export const updateUserStatusAdmin = async (userId, newStatus) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ status: newStatus })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;

        if (newStatus === 'inactive' || newStatus === 'suspended') { // Example statuses implying a ban
             await supabase.auth.admin.updateUserById(userId, {
                ban_duration: 'none' // Ensure this correctly reflects 'inactive' if it means not banned
            });
        } else if (newStatus === 'active') {
            // If user was banned, this would unban. Adjust as needed.
             await supabase.auth.admin.updateUserById(userId, {
                ban_duration: 'none' 
            });
        }

        return data;
    } catch (error) {
        throw handleError(error, 'updateUserStatusAdmin');
    }
};

export const updateUserRoleAdmin = async (userId, newRoleId) => {
  try {
    // Update role_id in public.users table
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .update({ role_id: newRoleId })
      .eq('id', userId)
      .select()
      .single();

    if (publicUserError) throw publicUserError;

    // Update role_id in auth.users app_metadata
    // Fetch current app_metadata first as updateUserById overwrites it
    const { data: { user: authUserBefore }, error: fetchAuthError } = await supabase.auth.admin.getUserById(userId);
    if (fetchAuthError) throw fetchAuthError;
    
    const newAppMetadata = { ...authUserBefore.app_metadata, role_id: newRoleId };

    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { app_metadata: newAppMetadata }
    );
    if (authError) throw authError;

    return { ...publicUser, role_id: newRoleId }; // Return updated public user info
  } catch (error) {
    throw handleError(error, 'updateUserRoleAdmin');
  }
};

export const deleteUserAdmin = async (userId) => {
  try {
    const { data, error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'deleteUserAdmin');
  }
};

export const fetchRoles = async (tenantId) => {
    try {
        let query = supabase.from('roles').select('id, name');
        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        } else {
          query = query.is('tenant_id', null); 
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchRoles');
    }
};

export const importUsersAdmin = async (usersData, tenantId) => {
  const results = [];
  for (const userData of usersData) {
    try {
      const userToCreate = {
        ...userData,
        tenant_id: tenantId,
        // Ensure role_id is correctly mapped from userData.role (name) to an ID
      };
      if(userData.role && !userData.role_id) {
        const { data: roleObj, error: roleError } = await supabase.from('roles').select('id').eq('name', userData.role).eq('tenant_id', tenantId).single();
        if(roleError || !roleObj) {
          results.push({ email: userData.email, success: false, error: `Role '${userData.role}' not found for tenant.` });
          continue;
        }
        userToCreate.role_id = roleObj.id;
      }

      const createdUser = await createNewUserAdmin(userToCreate);
      results.push({ email: userData.email, success: true, data: createdUser });
    } catch (error) {
      results.push({ email: userData.email, success: false, error: error.message });
    }
  }
  return { message: "User import process completed.", results };
};
