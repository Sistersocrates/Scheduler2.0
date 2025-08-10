
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

export const fetchSystemSettings = async (tenantId, { category } = {}) => {
  try {
    let query = supabase.from('system_settings').select('*');
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    } else {
      query = query.is('tenant_id', null); 
    }
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;

    const settingsObj = data.reduce((acc, curr) => {
        if (!acc[curr.category]) {
            acc[curr.category] = {};
        }
        acc[curr.category][curr.key] = curr.value;
        return acc;
    }, {});
    return settingsObj;
  } catch (error) {
    throw handleError(error, 'fetchSystemSettings');
  }
};

export const updateSystemSettings = async (tenantId, settingsToUpdate) => {
  try {
    const upsertArray = [];
    for (const category in settingsToUpdate) {
        for (const key in settingsToUpdate[category]) {
            upsertArray.push({
                tenant_id: tenantId, 
                category: category,
                key: key,
                value: settingsToUpdate[category][key]
            });
        }
    }
    if (upsertArray.length === 0) return { message: "No settings to update." };

    const { data, error } = await supabase
      .from('system_settings')
      .upsert(upsertArray, { onConflict: 'tenant_id,category,key' })
      .select();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'updateSystemSettings');
  }
};

export const fetchAcademicTermsAdmin = async (tenantId, { isActive } = {}) => {
    try {
        let query = supabase.from('academic_terms').select('*').eq('tenant_id', tenantId);
        if (typeof isActive === 'boolean') {
            query = query.eq('is_active', isActive);
        }
        const { data, error } = await query.order('start_date', { ascending: false });
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchAcademicTermsAdmin');
    }
};

export const createAcademicTermAdmin = async (termDetails) => {
    try {
        const { data, error } = await supabase
            .from('academic_terms')
            .insert([termDetails])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'createAcademicTermAdmin');
    }
};

export const updateAcademicTermAdmin = async (termId, termDetails) => {
    try {
        const { data, error } = await supabase
            .from('academic_terms')
            .update(termDetails)
            .eq('id', termId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'updateAcademicTermAdmin');
    }
};

export const fetchCreditTypesAdmin = async (tenantId, { isActive } = {}) => {
    try {
        let query = supabase.from('credit_types').select('*').eq('tenant_id', tenantId);
        if (typeof isActive === 'boolean') {
            query = query.eq('is_active', isActive);
        }
        const { data, error } = await query.order('name');
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchCreditTypesAdmin');
    }
};

export const createCreditTypeAdmin = async (creditTypeDetails) => {
    try {
        const { data, error } = await supabase
            .from('credit_types')
            .insert([creditTypeDetails])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'createCreditTypeAdmin');
    }
};

export const updateCreditTypeAdmin = async (creditTypeId, creditTypeDetails) => {
    try {
        const { data, error } = await supabase
            .from('credit_types')
            .update(creditTypeDetails)
            .eq('id', creditTypeId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'updateCreditTypeAdmin');
    }
};
