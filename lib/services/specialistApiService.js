
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/errorHandler';

// Appointment Management
export const fetchSpecialistAppointments = async (specialistId, dateRange) => {
  try {
    let query = supabase
      .from('student_appointments')
      .select(`
        *,
        student:users!student_appointments_student_id_fkey (id, first_name, last_name, email),
        specialist:users!student_appointments_specialist_id_fkey (id, first_name, last_name, email)
      `)
      .eq('specialist_id', specialistId);

    if (dateRange?.start) query = query.gte('start_time', dateRange.start);
    if (dateRange?.end) query = query.lte('end_time', dateRange.end);
    
    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'fetchSpecialistAppointments');
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const { data, error } = await supabase
      .from('student_appointments')
      .insert([appointmentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'createAppointment');
  }
};

export const updateAppointment = async (appointmentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('student_appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'updateAppointment');
  }
};

export const cancelSpecialistAppointment = async (appointmentId) => {
  try {
    const { data, error } = await supabase
      .from('student_appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'cancelSpecialistAppointment');
  }
};

export const manageSpecialistAvailability = async (availabilityData) => {
    // This could involve creating, updating, or deleting slots in 'specialist_availability' table
    try {
        // Example: Upserting availability slots
        const { data, error } = await supabase
            .from('specialist_availability')
            .upsert(availabilityData, { onConflict: 'id' }) // Assuming 'id' is the conflict target
            .select();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'manageSpecialistAvailability');
    }
};


// Student Management
export const searchStudentsAsSpecialist = async (searchTerm, tenantId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, roles (name)')
      .eq('tenant_id', tenantId)
      // .eq('roles.name', 'student') // This might require a join or a view if roles is a separate table linked many-to-many
      .filter('roles.name', 'eq', 'student') // This assumes 'roles' is a related table and RLS allows access
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10);
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'searchStudentsAsSpecialist');
  }
};

export const fetchStudentProfileForSpecialist = async (studentId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id, first_name, last_name, email, profile_image_url, status,
                student_profiles (*), 
                roles (name)
            `)
            .eq('id', studentId)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchStudentProfileForSpecialist');
    }
};

export const fetchStudentScheduleForSpecialist = async (studentId) => {
    // Similar to studentApiService.fetchStudentSchedule but for a specific student by ID
    // This would query 'class_enrollments' and join with 'classes' table
    try {
        const { data, error } = await supabase
            .from('class_enrollments')
            .select(`
                *,
                classes:classes_old!inner (title, description, room, hour, teacher_name:teachers_old(name)) 
            `)
            .eq('student_id', studentId)
            .eq('status', 'enrolled');
        if (error) throw error;
        return data.map(item => ({ ...item.classes, enrollment_status: item.status, enrollment_id: item.id }));
    } catch (error) {
        throw handleError(error, 'fetchStudentScheduleForSpecialist');
    }
};

export const createStudentNote = async (noteData) => {
  try {
    const { data, error } = await supabase
      .from('student_specialist_notes')
      .insert([noteData])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'createStudentNote');
  }
};

export const fetchStudentNotes = async (studentId, specialistId) => {
    try {
        const { data, error } = await supabase
            .from('student_specialist_notes')
            .select('*')
            .eq('student_id', studentId)
            .eq('specialist_id', specialistId) // Ensure specialist can only see their notes or based on policy
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'fetchStudentNotes');
    }
};

// Group Management
export const fetchSpecialistGroups = async (specialistId) => {
  try {
    const { data, error } = await supabase
      .from('student_groups')
      .select('*, group_members(count)')
      .eq('specialist_id', specialistId);
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'fetchSpecialistGroups');
  }
};

export const createStudentGroup = async (groupData) => {
  try {
    const { data, error } = await supabase
      .from('student_groups')
      .insert([groupData])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'createStudentGroup');
  }
};

export const manageGroupMembers = async (groupId, studentId, action = 'add') => {
    try {
        if (action === 'add') {
            const { data, error } = await supabase.from('group_members').insert([{ group_id: groupId, student_id: studentId }]).select();
            if (error) throw error;
            return data;
        } else if (action === 'remove') {
            const { data, error } = await supabase.from('group_members').delete().match({ group_id: groupId, student_id: studentId });
            if (error) throw error;
            return data;
        }
    } catch (error) {
        throw handleError(error, 'manageGroupMembers');
    }
};


// Special Event Management
export const fetchSpecialEventsBySpecialist = async (specialistId) => {
  try {
    const { data, error } = await supabase
      .from('special_events')
      .select('*, event_registrations(count)')
      .eq('specialist_id', specialistId);
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'fetchSpecialEventsBySpecialist');
  }
};

export const createSpecialEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('special_events')
      .insert([eventData])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw handleError(error, 'createSpecialEvent');
  }
};

export const manageEventRegistrations = async (eventId, studentId, action = 'register') => {
    // This would handle registering/unregistering students for an event
    try {
        if (action === 'register') {
            const { data, error } = await supabase.from('event_registrations').insert([{ event_id: eventId, student_id: studentId }]).select();
            if (error) throw error;
            return data;
        } else if (action === 'unregister') {
             const { data, error } = await supabase.from('event_registrations').delete().match({ event_id: eventId, student_id: studentId });
            if (error) throw error;
            return data;
        }
    } catch (error) {
        throw handleError(error, 'manageEventRegistrations');
    }
};

export const trackEventAttendance = async (registrationId, attendedStatus) => {
    try {
        const { data, error } = await supabase
            .from('event_registrations')
            .update({ attended: attendedStatus })
            .eq('id', registrationId)
            .select();
        if (error) throw error;
        return data;
    } catch (error) {
        throw handleError(error, 'trackEventAttendance');
    }
};

export const assignEventCredits = async (eventId, studentIds, creditValue) => {
    // This is complex: might involve updating student_credits table or similar
    // For each studentId in studentIds, if they attended eventId, award creditValue
    try {
        const operations = studentIds.map(student_id => ({
            student_id,
            // class_id: null, // Or link to event if schema supports
            event_id: eventId, 
            credit_amount: creditValue,
            credit_type: 'special_event',
            earned_date: new Date().toISOString().split('T')[0], // Today's date
            // tenant_id needs to be fetched or passed
        }));
        // const { data, error } = await supabase.from('student_credits').insert(operations).select();
        // if (error) throw error;
        // return data;
        console.log("Assigning credits (placeholder):", operations);
        return { message: `${operations.length} students processed for credits.`};
    } catch (error) {
        throw handleError(error, 'assignEventCredits');
    }
};

// Specialist Notifications (Placeholder)
export const fetchSpecialistNotifications = async (specialistId) => {
    try {
        // This would query a notifications table filtered by specialist_id
        // Example:
        // const { data, error } = await supabase.from('notifications')
        //   .select('*').eq('user_id', specialistId).order('created_at', {ascending: false});
        // if (error) throw error;
        // return data;
        return Promise.resolve([ 
            {id: 1, title: "New Appointment Request", message: "Student X requested an appointment.", created_at: new Date().toISOString(), read: false, type: 'appointment'},
            {id: 2, title: "Group Session Reminder", message: "Social Skills group meets tomorrow.", created_at: new Date().toISOString(), read: true, type: 'group_session'},
        ]);
    } catch (error) {
        throw handleError(error, 'fetchSpecialistNotifications');
    }
};

export const markSpecialistNotificationAsRead = async (notificationId) => {
     try {
        // const { data, error } = await supabase.from('notifications')
        //   .update({ read: true }).eq('id', notificationId).select();
        // if (error) throw error;
        // return data;
        return Promise.resolve({id: notificationId, read: true});
    } catch (error) {
        throw handleError(error, 'markSpecialistNotificationAsRead');
    }
};
