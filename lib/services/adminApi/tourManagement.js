
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

export const fetchTours = async (tenantId) => {
    try {
        const { data, error } = await supabase
            .from('parent_tours')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('tour_date', { ascending: true })
            .order('tour_time', { ascending: true });
        if(error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchTours');
    }
};

export const scheduleTour = async (tourData) => {
    try {
        const { data, error } = await supabase
            .from('parent_tours')
            .insert([tourData])
            .select()
            .single();
        if(error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'scheduleTour');
    }
};

export const updateTourAdmin = async (tourId, tourDetails) => {
    try {
        const { data, error } = await supabase
            .from('parent_tours')
            .update(tourDetails)
            .eq('id', tourId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'updateTourAdmin');
    }
};

export const deleteTourAdmin = async (tourId) => {
    try {
        const { data, error } = await supabase
            .from('parent_tours')
            .delete()
            .eq('id', tourId);
        if (error) throw error;
        return data; 
    } catch (error) {
        throw handleError(error, 'deleteTourAdmin');
    }
};
