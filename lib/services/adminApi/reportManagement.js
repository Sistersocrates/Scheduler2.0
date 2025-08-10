
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

export const fetchReportDefinitionsAdmin = async (tenantId, { type } = {}) => {
    try {
        let query = supabase.from('reports').select('*').eq('tenant_id', tenantId);
        if (type) {
            query = query.eq('type', type);
        }
        const { data, error } = await query.order('name');
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchReportDefinitionsAdmin');
    }
};

export const createReportDefinitionAdmin = async (reportDetails) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .insert([reportDetails])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'createReportDefinitionAdmin');
    }
};

export const runReportAdmin = async (reportId, runByUserId) => {
    try {
        const { data: reportDef, error: fetchError } = await supabase.from('reports').select('tenant_id').eq('id', reportId).single();
        if (fetchError) throw fetchError;

        const resultData = { 
            message: "Report generated successfully (Placeholder)", 
            generated_at: new Date().toISOString() 
        };
        const { data, error } = await supabase
            .from('report_results')
            .insert([{ 
                report_id: reportId, 
                tenant_id: reportDef.tenant_id, 
                result_data: resultData, 
                run_by: runByUserId 
            }])
            .select()
            .single();
        if (error) throw error;

        await supabase.from('reports').update({ last_run_at: new Date().toISOString() }).eq('id', reportId);

        return data;
    } catch (error) {
        throw handleError(error, 'runReportAdmin');
    }
};

export const fetchReportResultsAdmin = async (reportId) => {
    try {
        const { data, error } = await supabase
            .from('report_results')
            .select('*, run_by_user:users(email, first_name, last_name)')
            .eq('report_id', reportId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchReportResultsAdmin');
    }
};
