
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

export const fetchIntegrationConfigsAdmin = async (tenantId, { integrationType, isActive } = {}) => {
    try {
        let query = supabase.from('integration_configs').select('*');
        
        // If tenantId is explicitly provided, filter by it.
        // Otherwise, assume fetching for the current admin's tenant or system-wide if appropriate.
        // This logic might need refinement based on how tenantId is passed for system-wide configs.
        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        }
        // else { query = query.is('tenant_id', null); } // For system-wide, if applicable

        if (integrationType) {
            query = query.eq('integration_type', integrationType);
        }
        if (typeof isActive === 'boolean') {
            query = query.eq('is_active', isActive);
        }
        const { data, error } = await query.order('integration_type');
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchIntegrationConfigsAdmin');
    }
};

export const fetchIntegrationConfigByIdAdmin = async (instanceId) => {
    try {
        const { data, error } = await supabase
            .from('integration_configs')
            .select('*')
            .eq('id', instanceId)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchIntegrationConfigByIdAdmin');
    }
};


export const createIntegrationConfigAdmin = async (configDetails) => {
    // tenant_id, integration_type, config are required in configDetails
    try {
        const { data, error } = await supabase
            .from('integration_configs')
            .insert([configDetails])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'createIntegrationConfigAdmin');
    }
};

export const updateIntegrationConfigAdmin = async (instanceId, updates) => {
    // updates should contain fields to update, e.g., { config: newConfig, is_active: newStatus }
    try {
        const { data, error } = await supabase
            .from('integration_configs')
            .update(updates)
            .eq('id', instanceId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'updateIntegrationConfigAdmin');
    }
};

export const deleteIntegrationConfigAdmin = async (instanceId) => {
    try {
        const { error } = await supabase
            .from('integration_configs')
            .delete()
            .eq('id', instanceId);
        if (error) throw error;
        return { message: "Integration instance deleted successfully." };
    } catch (error) {
        throw handleError(error, 'deleteIntegrationConfigAdmin');
    }
};


// Sync Log Management
export const fetchIntegrationSyncLogsAdmin = async (integrationConfigId, tenantId, { page = 1, limit = 20 } = {}) => {
    try {
        let query = supabase
            .from('integration_sync_logs')
            .select('*, triggered_by_user:users(email, first_name, last_name)', { count: 'exact' });

        if (integrationConfigId) {
            query = query.eq('integration_config_id', integrationConfigId);
        }
        if (tenantId) { // Filter by tenant if provided, useful for system admins viewing specific tenant logs
            query = query.eq('tenant_id', tenantId);
        }
        
        query = query.order('created_at', { ascending: false })
                     .range((page - 1) * limit, page * limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { logs: data, count };
    } catch (error) {
        throw handleError(error, 'fetchIntegrationSyncLogsAdmin');
    }
};

// Data Mapping Management
export const createDataMappingAdmin = async (mappingDetails) => {
    // tenant_id, integration_config_id, source_system, entity_type, mapping_config are required
    try {
        const { data, error } = await supabase
            .from('data_mappings')
            .insert([mappingDetails])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'createDataMappingAdmin');
    }
};

export const fetchDataMappingsAdmin = async (integrationConfigId, tenantId) => {
    try {
        let query = supabase.from('data_mappings').select('*');
        if (integrationConfigId) {
            query = query.eq('integration_config_id', integrationConfigId);
        }
        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        }
        // else { query = query.is('tenant_id', null); } // For system-wide, if applicable

        const { data, error } = await query.order('entity_type');
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchDataMappingsAdmin');
    }
};

export const updateDataMappingAdmin = async (mappingId, mappingDetails) => {
    try {
        const { data, error } = await supabase
            .from('data_mappings')
            .update(mappingDetails)
            .eq('id', mappingId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'updateDataMappingAdmin');
    }
};

export const deleteDataMappingAdmin = async (mappingId) => {
    try {
        const { error } = await supabase
            .from('data_mappings')
            .delete()
            .eq('id', mappingId);
        if (error) throw error;
        return { message: "Data mapping deleted successfully." };
    } catch (error) {
        throw handleError(error, 'deleteDataMappingAdmin');
    }
};
