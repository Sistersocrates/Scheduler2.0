
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ydagmubnyruciwwbjxvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYWdtdWJueXJ1Y2l3d2JqeHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzE5MTIsImV4cCI6MjA2MTM0NzkxMn0.3t2T9eTCQPeTb2n2V3AJ_RWNQCRe4lhkC780J_HlG6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadSeminarImage = async (file) => {
  try {
    if (!file) return null;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPG and PNG files are allowed');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('seminar-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('seminar-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image. Please try again.');
  }
};

export const createOrUpdateStudent = async (userData) => {
  try {
    if (!userData?.email || !userData?.name) {
      throw new Error('Missing required student information');
    }

    const [firstName, ...lastNameParts] = userData.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'Unknown';

    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (!existingStudent) {
      const { data, error } = await supabase
        .from('students')
        .insert({
          id: parseInt(userData.sub, 10),
          email: userData.email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return existingStudent;
  } catch (error) {
    console.error('Error in createOrUpdateStudent:', error);
    throw error;
  }
};

export const createSeminar = async (seminarData) => {
  try {
    const { data, error } = await supabase
      .from('seminars')
      .insert([{
        ...seminarData,
        is_locked: false,
        current_enrollment: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Create seminar error:', error);
      throw error;
    }
    return data[0];
  } catch (error) {
    console.error('Error creating seminar:', error);
    throw error;
  }
};

export const fetchTeacherSeminars = async (teacherEmail) => {
  try {
    const { data, error } = await supabase
      .from('seminars')
      .select('*, registrations(*)')
      .eq('teacher_email', teacherEmail)
      .order('hour', { ascending: true });

    if (error) {
      console.error('Fetch seminars error:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching teacher seminars:', error);
    throw error;
  }
};

export const fetchAttendance = async (seminarId) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students (
          first_name,
          last_name,
          email
        )
      `)
      .eq('seminar_id', seminarId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Fetch attendance error:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const updateAttendance = async (recordId, newStatus) => {
  try {
    const { error } = await supabase
      .from('attendance')
      .update({ status: newStatus })
      .eq('id', recordId);

    if (error) {
      console.error('Update attendance error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

export const subscribeToAttendanceUpdates = (seminarId, callback) => {
  return supabase
    .channel(`attendance_${seminarId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attendance',
        filter: `seminar_id=eq.${seminarId}`
      },
      callback
    )
    .subscribe();
};

export const fetchAvailableSeminars = async () => {
  try {
    const { data, error } = await supabase
      .from('seminars')
      .select('*')
      .eq('is_locked', false)
      .order('hour', { ascending: true });

    if (error) {
      console.error('Fetch available seminars error:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching seminars:', error);
    throw error;
  }
};

export const fetchStudentRegistrations = async (studentEmail) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('student_email', studentEmail);

    if (error) {
      console.error('Fetch registrations error:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
};

export const getSeminarEnrollment = async (seminarId) => {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('seminar_id', seminarId);

    if (error) {
      console.error('Get enrollment error:', error);
      throw error;
    }
    return count || 0;
  } catch (error) {
    console.error('Error getting enrollment:', error);
    throw error;
  }
};

export const getPeriodTime = (hour) => {
  const periodTimes = {
    1: "9:00 - 9:45",
    2: "9:45 - 10:30",
    3: "10:30 - 11:15",
    4: "11:15 - 12:00",
    5: "12:30 - 1:20",
    6: "1:20 - 2:15",
    7: "2:15 - 3:05"
  };
  return periodTimes[hour] || "Time not specified";
};

export const checkWaitlistPosition = async (seminarId, studentEmail) => {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('position')
      .match({
        seminar_id: seminarId,
        student_email: studentEmail
      })
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Check waitlist error:', error);
      throw error;
    }
    return data?.position || null;
  } catch (error) {
    console.error('Error checking waitlist position:', error);
    return null;
  }
};

export const getWaitlistCount = async (seminarId) => {
  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('seminar_id', seminarId);

    if (error) {
      console.error('Get waitlist count error:', error);
      throw error;
    }
    return count || 0;
  } catch (error) {
    console.error('Error getting waitlist count:', error);
    return 0;
  }
};
