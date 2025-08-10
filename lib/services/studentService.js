
import { supabase } from '@/lib/supabase/client';
import { handleSupabaseError, handleSupabaseQueryError } from '@/lib/utils/errors/supabaseErrors';
import { handleError } from '@/lib/utils/errorHandler'; // General error handler

// This function is now less about creating/updating the core user record (handled by authService and triggers)
// and more about managing student-specific profile details if the 'students' table is kept for that.
// For now, we assume 'users' table is the primary source, and 'students' might be for extended profile.
export const getStudentSpecificProfile = async (userId) => {
  try {
    // Assuming userId is the UUID from the public.users table
    const { data, error } = await supabase
      .from('students') // This is the specific 'students' table, not 'users'
      .select('*')
      .eq('user_id', userId) // Assuming 'students' table has a 'user_id' FK to 'users.id'
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No specific student profile found
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Error fetching student-specific profile:', err);
    throw new Error(handleError(err, 'getStudentSpecificProfile'));
  }
};

// Example: Update student-specific details (e.g., advisor, grade)
export const updateStudentSpecificProfile = async (userId, profileDetails) => {
  try {
    // Validate profileDetails specific to students table
    if (!userId) throw new Error('User ID is required to update student profile.');
    // Add more validation for advisor, grade etc. if necessary

    const { data, error } = await supabase
      .from('students')
      .update({
        advisor: profileDetails.advisor,
        grade: profileDetails.grade,
        // any other student-specific fields
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating student-specific profile:', err);
    throw new Error(handleError(err, 'updateStudentSpecificProfile'));
  }
};


export const fetchStudentRegistrations = async (studentEmail) => {
  try {
    if (!studentEmail) {
      throw new Error('Student email is required');
    }

    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        seminars (
          id,
          title,
          description,
          hour,
          room,
          teacher_name,
          image_url
        )
      `)
      .eq('student_email', studentEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch registrations error:', error);
      throw new Error(handleSupabaseQueryError(error));
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching student registrations:', error);
    throw error;
  }
};

// createOrUpdateStudent is largely superseded by the handle_new_user trigger
// and the user profile management in authService.
// If 'students' table stores additional info, this function might adapt.
// For now, it's commented out to avoid conflict with the new auth flow.
/*
export const createOrUpdateStudent = async (userData) => {
  // userData here would be the full user object from authService
  try {
    // This should now primarily focus on the 'students' table if it holds extended data
    // The core user creation is in 'users' table via trigger.
    const { data: existingStudentSpecificProfile, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', userData.profile.id) // Assuming userData.profile.id is the users.id
      .single();

    // ... logic to insert or update student-specific fields in 'students' table ...
  } catch (error) {
    console.error('Error in createOrUpdateStudent (studentService):', error);
    throw error; 
  }
};
*/
