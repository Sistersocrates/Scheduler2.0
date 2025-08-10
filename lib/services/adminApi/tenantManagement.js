
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

export const fetchTenants = async ({ status } = {}) => {
  try {
    let query = supabase.from('tenants').select('*');
    if (status) {
      // Assuming tenants table has a 'status' column. If not, this filter needs adjustment.
      // query = query.eq('status', status); 
      console.warn("Status filter on tenants is a placeholder; 'status' column not in current schema.");
    }
    const { data, error } = await query.order('name');
    if (error) throw error;
    return data || [];
  } catch (error) { throw handleError(error, 'fetchTenants'); }
};

export const createTenantAdmin = async (tenantDetails) => {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .insert([tenantDetails])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'createTenantAdmin');
    }
};

export const fetchTenantByIdAdmin = async (tenantId) => {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchTenantByIdAdmin');
    }
};

export const updateTenantAdmin = async (tenantId, tenantDetails) => {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .update(tenantDetails)
            .eq('id', tenantId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'updateTenantAdmin');
    }
};

export const updateTenantStatusAdmin = async (tenantId, newStatus) => {
    try {
        // This assumes tenants table will have a 'status' column.
        // As of the last schema, it does not. This is a conceptual function.
        // To make this work, add a 'status VARCHAR(50)' column to tenants table.
        const { data, error } = await supabase
            .from('tenants')
            // .update({ status: newStatus }) // Uncomment when 'status' column exists
            .update({ name: `${(await fetchTenantByIdAdmin(tenantId)).name.split(' - Status:')[0]} - Status: ${newStatus}` }) // Placeholder
            .eq('id', tenantId)
            .select()
            .single();
        if (error) throw error;
        console.warn("updateTenantStatusAdmin is using a placeholder for status on the name field.");
        return data;
    } catch (error) {
        throw handleError(error, 'updateTenantStatusAdmin');
    }
};
