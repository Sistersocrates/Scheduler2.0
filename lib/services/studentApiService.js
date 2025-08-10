
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

const periodsConfig = [
  { id: 1, name: "1st Period", time: "9:00 - 9:45" },
  { id: 2, name: "2nd Period", time: "9:45 - 10:30" },
  { id: 3, name: "3rd Period", time: "10:30 - 11:15" },
  { id: 4, name: "4th Period", time: "11:15 - 12:00" },
  { id: 5, name: "5th Period", time: "12:30 - 1:20" },
  { id: 6, name: "6th Period", time: "1:20 - 2:15" },
  { id: 7, name: "7th Period", time: "2:15 - 3:05" }
];

export const getPeriodsConfig = () => periodsConfig;

export const fetchStudentDashboardData = async (studentUserId, studentEmail) => {
  try {
    if (!studentUserId || !studentEmail) {
      throw new Error('Student user ID and email are required.');
    }

    const [
      { data: seminarsData, error: seminarsError },
      { data: registrationsData, error: registrationsError },
      { data: studentProfileData, error: studentProfileError }
    ] = await Promise.all([
      supabase.from('seminars').select('*').order('hour'),
      supabase.from('class_enrollments')
        .select(`
          id, 
          class_id, 
          status, 
          seminars (id, hour, title, teacher_name, room)
        `)
        .eq('student_id', studentUserId),
      supabase.from('student_profiles').select('*').eq('user_id', studentUserId).single()
    ]);

    if (seminarsError) throw seminarsError;
    if (registrationsError) throw registrationsError;
    if (studentProfileError && studentProfileError.code !== 'PGRST116') {
        throw studentProfileError;
    }


    const seminarsWithEnrollmentCount = await Promise.all(
      seminarsData.map(async (seminar) => {
        const { count, error: countError } = await supabase
          .from('class_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', seminar.id)
          .eq('status', 'enrolled');
        if (countError) {
          console.warn(`Could not fetch enrollment count for seminar ${seminar.id}: ${countError.message}`);
          return { ...seminar, current_enrollment: 0 };
        }
        return { ...seminar, current_enrollment: count || 0 };
      })
    );
    
    const processedRegistrations = {};
    registrationsData.forEach(reg => {
      if (reg.seminars) { // seminars is the joined table data
        processedRegistrations[reg.seminars.hour] = {
          enrollment_id: reg.id,
          seminar_id: reg.seminars.id,
          title: reg.seminars.title,
          teacher_name: reg.seminars.teacher_name,
          room: reg.seminars.room,
          status: reg.status
        };
      }
    });

    return {
      seminars: seminarsWithEnrollmentCount,
      registrations: processedRegistrations,
      studentProfile: studentProfileData,
    };
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    throw new Error(handleError(error, 'fetchStudentDashboardData'));
  }
};


export const enrollInClass = async (studentUserId, classId, tenantId) => {
  try {
    if (!studentUserId || !classId || !tenantId) {
      throw new Error('Student ID, Class ID, and Tenant ID are required for enrollment.');
    }

    const { data: seminar, error: seminarError } = await supabase
      .from('seminars')
      .select('capacity, current_enrollment, hour')
      .eq('id', classId)
      .single();

    if (seminarError) throw seminarError;
    if (!seminar) throw new Error('Seminar not found.');

    if (seminar.current_enrollment >= seminar.capacity) {
      // Handle waitlist logic if capacity is full
      const { data: waitlistEntry, error: waitlistError } = await supabase
        .from('class_enrollments')
        .insert({
          student_id: studentUserId,
          class_id: classId,
          tenant_id: tenantId,
          status: 'waitlisted',
          enrollment_date: new Date().toISOString(),
        })
        .select()
        .single();
      if (waitlistError) throw waitlistError;
      return { status: 'waitlisted', data: waitlistEntry };
    }

    // Check if student is already registered for this period (hour)
    const { data: existingEnrollmentForHour, error: existingEnrollmentError } = await supabase
      .from('class_enrollments')
      .select('id, seminars(hour)')
      .eq('student_id', studentUserId)
      .eq('status', 'enrolled')
      .eq('seminars.hour', seminar.hour); // This requires a join or a view. Simpler: check after fetching seminar.

    if(existingEnrollmentError) throw existingEnrollmentError;

    // A more direct way to check existing enrollment for the specific hour of the target class
    const { data: currentEnrollmentsForHour, error: currentEnrollmentsError } = await supabase
      .from('class_enrollments')
      .select('id, class_id, seminars!inner(hour)')
      .eq('student_id', studentUserId)
      .eq('status', 'enrolled')
      .eq('seminars.hour', seminar.hour);

    if (currentEnrollmentsError) throw currentEnrollmentsError;

    if (currentEnrollmentsForHour && currentEnrollmentsForHour.length > 0) {
      throw new Error(`Already enrolled in a class for period ${seminar.hour}.`);
    }


    const { data: enrollment, error: enrollError } = await supabase
      .from('class_enrollments')
      .insert({
        student_id: studentUserId,
        class_id: classId,
        tenant_id: tenantId,
        status: 'enrolled',
        enrollment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (enrollError) throw enrollError;
    
    // This should ideally be a transaction or a DB trigger
    await supabase
      .from('seminars')
      .update({ current_enrollment: (seminar.current_enrollment || 0) + 1 })
      .eq('id', classId);

    return { status: 'enrolled', data: enrollment };
  } catch (error) {
    console.error('Error enrolling in class:', error);
    throw new Error(handleError(error, 'enrollInClass'));
  }
};

export const dropClassEnrollment = async (enrollmentId, classId) => {
  try {
    if (!enrollmentId || !classId) {
      throw new Error('Enrollment ID and Class ID are required to drop a class.');
    }
    
    const { error: deleteError } = await supabase
      .from('class_enrollments')
      .delete()
      .eq('id', enrollmentId);

    if (deleteError) throw deleteError;

    // This should ideally be a transaction or a DB trigger
    // Decrement current_enrollment on the seminar
    // Need to fetch current enrollment first to avoid race conditions if not using DB trigger
     const { data: seminar, error: seminarError } = await supabase
      .from('seminars')
      .select('current_enrollment')
      .eq('id', classId)
      .single();

    if (seminarError) throw seminarError;

    if (seminar) {
      await supabase
        .from('seminars')
        .update({ current_enrollment: Math.max(0, (seminar.current_enrollment || 0) - 1) })
        .eq('id', classId);
    }
    
    // Potentially promote someone from waitlist here

    return { message: 'Successfully dropped class.' };
  } catch (error) {
    console.error('Error dropping class enrollment:', error);
    throw new Error(handleError(error, 'dropClassEnrollment'));
  }
};

export const fetchStudentSchedule = async (studentUserId) => {
  try {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        id,
        status,
        seminars (
          id,
          title,
          description,
          hour,
          room,
          teacher_name,
          community_partner,
          notes
        )
      `)
      .eq('student_id', studentUserId)
      .eq('status', 'enrolled'); 
      // Add date range filtering if needed

    if (error) throw error;
    return data.map(item => ({ ...item.seminars, enrollment_id: item.id, enrollment_status: item.status }));
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    throw new Error(handleError(error, 'fetchStudentSchedule'));
  }
};

export const fetchAvailableClasses = async (filters = {}) => {
  try {
    let query = supabase.from('seminars').select('*').eq('is_locked', false); // Assuming is_locked field exists

    if (filters.hour) query = query.eq('hour', filters.hour);
    if (filters.day) {} // Add day filtering if applicable
    if (filters.search_term) query = query.ilike('title', `%${filters.search_term}%`);
    
    query = query.order('hour');

    const { data, error } = await query;
    if (error) throw error;

    // Add current enrollment count to each seminar
    const seminarsWithEnrollment = await Promise.all(
      data.map(async (seminar) => {
        const { count } = await supabase
          .from('class_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', seminar.id)
          .eq('status', 'enrolled');
        return { ...seminar, current_enrollment: count || 0 };
      })
    );
    return seminarsWithEnrollment;
  } catch (error) {
    console.error('Error fetching available classes:', error);
    throw new Error(handleError(error, 'fetchAvailableClasses'));
  }
};


export const fetchStudentAppointments = async (studentUserId, dateRange) => {
  try {
    let query = supabase
      .from('student_appointments')
      .select(`
        *,
        specialist:specialist_id (id, first_name, last_name, email)
      `)
      .eq('student_id', studentUserId);

    if (dateRange?.start) query = query.gte('start_time', dateRange.start);
    if (dateRange?.end) query = query.lte('end_time', dateRange.end);
    
    query = query.order('start_time');

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching student appointments:', error);
    throw new Error(handleError(error, 'fetchStudentAppointments'));
  }
};

export const requestAppointment = async (studentUserId, specialistId, tenantId, appointmentDetails) => {
  try {
    const { data, error } = await supabase
      .from('student_appointments')
      .insert({
        student_id: studentUserId,
        specialist_id: specialistId,
        tenant_id: tenantId,
        title: appointmentDetails.title,
        description: appointmentDetails.description,
        start_time: appointmentDetails.startTime,
        end_time: appointmentDetails.endTime,
        location: appointmentDetails.location,
        status: 'scheduled', // Or 'pending_approval'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error requesting appointment:', error);
    throw new Error(handleError(error, 'requestAppointment'));
  }
};

export const updateAppointment = async (appointmentId, updatedDetails) => {
  try {
    const { data, error } = await supabase
      .from('student_appointments')
      .update(updatedDetails)
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error(handleError(error, 'updateAppointment'));
  }
};

export const cancelAppointment = async (appointmentId) => {
  try {
    // Option 1: Soft delete by updating status
    // const { data, error } = await supabase
    //   .from('student_appointments')
    //   .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    //   .eq('id', appointmentId)
    //   .select()
    //   .single();

    // Option 2: Hard delete
    const { error } = await supabase
      .from('student_appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) throw error;
    return { message: 'Appointment cancelled successfully.' };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw new Error(handleError(error, 'cancelAppointment'));
  }
};


export const fetchStudentAttendance = async (studentUserId, filters = {}) => {
  try {
    // This would require an 'attendance' table that links students to classes/seminars with a status and date.
    // For now, this is a placeholder.
    // Example:
    // let query = supabase.from('attendance_records')
    //   .select('*, classes(title), seminars(title)')
    //   .eq('student_id', studentUserId);
    // if (filters.date_range) { /* apply date filter */ }
    // if (filters.class_id) { /* apply class filter */ }
    // const { data, error } = await query;
    // if (error) throw error;
    // return data;
    console.warn("fetchStudentAttendance: No 'attendance_records' table defined yet.");
    return [];
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    throw new Error(handleError(error, 'fetchStudentAttendance'));
  }
};

export const fetchStudentCredits = async (studentUserId, filters = {}) => {
  try {
    let query = supabase
      .from('student_credits')
      .select('*, class:class_id(title)') // Assuming class_id refers to a 'classes' or 'seminars' table
      .eq('student_id', studentUserId);

    if (filters.credit_type) query = query.eq('credit_type', filters.credit_type);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching student credits:', error);
    throw new Error(handleError(error, 'fetchStudentCredits'));
  }
};

export const fetchStudentNotifications = async (studentUserId, filters = {}) => {
  try {
    let query = supabase
      .from('student_notifications')
      .select('*')
      .eq('student_id', studentUserId);

    if (typeof filters.read_status === 'boolean') query = query.eq('read', filters.read_status);
    if (filters.type) query = query.eq('type', filters.type);
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    throw new Error(handleError(error, 'fetchStudentNotifications'));
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('student_notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(handleError(error, 'markNotificationAsRead'));
  }
};
