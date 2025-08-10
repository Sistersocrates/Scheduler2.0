
import { supabase } from './client';
import { handleSupabaseError, handleSupabaseQueryError } from '@/lib/utils/errors/supabaseErrors';
// Removed validateUserData import as it's now part of authService or studentService directly

export const createOrUpdateStudent = async (userData) => {
  try {
    // Basic validation, more comprehensive validation should be in a dedicated service or authService
    if (!userData || !userData.email || !userData.name || !userData.sub) {
      throw new Error('Invalid student data provided for create/update.');
    }

    const [firstName, ...lastNameParts] = userData.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'Unknown';

    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('id') // Only select id for checking existence
      .eq('email', userData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing student:', checkError);
      throw new Error(handleSupabaseQueryError(checkError));
    }

    const studentProfileData = {
      id: parseInt(userData.sub, 10),
      email: userData.email,
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString()
    };

    let result;
    if (!existingStudent) {
      studentProfileData.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('students')
        .insert(studentProfileData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('students')
        .update(studentProfileData)
        .eq('email', userData.email)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }
    
    return result;

  } catch (error) {
    console.error('Error in createOrUpdateStudent (supabase/students.js):', error);
    // Ensure the error is re-thrown or handled appropriately
    throw new Error(handleSupabaseError(error, 'students'));
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
