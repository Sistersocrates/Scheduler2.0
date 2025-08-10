
import { supabase } from '@/lib/supabase/client';
import { handleSupabaseError, handleSupabaseQueryError } from '@/lib/utils/errors/supabaseErrors';
import { handleError } from '@/lib/utils/errorHandler';

// Similar to studentService, this now focuses on teacher-specific profile details
// if the 'teachers' table is kept for that purpose.
export const getTeacherSpecificProfile = async (userId) => {
  try {
    // Assuming userId is the UUID from the public.users table
    const { data, error } = await supabase
      .from('teachers') // This is the specific 'teachers' table
      .select('*')
      .eq('user_id', userId) // Assuming 'teachers' table has a 'user_id' FK to 'users.id'
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No specific teacher profile
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Error fetching teacher-specific profile:', err);
    throw new Error(handleError(err, 'getTeacherSpecificProfile'));
  }
};

// Example: Update teacher-specific details (e.g., department, qualifications)
export const updateTeacherSpecificProfile = async (userId, profileDetails) => {
  try {
    if (!userId) throw new Error('User ID is required to update teacher profile.');
    // Add validation for teacher-specific fields

    const { data, error } = await supabase
      .from('teachers')
      .update({
        // department: profileDetails.department,
        // qualifications: profileDetails.qualifications,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating teacher-specific profile:', err);
    throw new Error(handleError(err, 'updateTeacherSpecificProfile'));
  }
};

export const fetchTeacherSeminars = async (teacherEmail) => {
  try {
    if (!teacherEmail) {
      throw new Error('Teacher email is required');
    }
    const { data, error } = await supabase
      .from('seminars')
      .select('*')
      .eq('teacher_email', teacherEmail) // This might change if seminars link to users.id via teacher_user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teacher seminars:', error);
      throw new Error(handleSupabaseQueryError(error));
    }
    return data || [];
  } catch (error) {
    console.error('Error in fetchTeacherSeminars:', error);
    throw error;
  }
};


// createOrUpdateTeacher is largely superseded by the handle_new_user trigger
// and user profile management in authService.
// Commented out for now.
/*
export const createOrUpdateTeacher = async (userData) => {
  try {
    // ... logic to insert or update teacher-specific fields in 'teachers' table ...
  } catch (error) {
    console.error('Error in createOrUpdateTeacher (teacherService):', error);
    throw error;
  }
};
*/
