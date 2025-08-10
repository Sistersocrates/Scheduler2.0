
import { validateEmail, validateName } from './dataValidation';

// Entity-specific validation
export const validateStudentData = (data) => {
  if (!data) return false;
  
  const requiredFields = ['email', 'first_name', 'last_name'];
  for (const field of requiredFields) {
    if (!data[field]) return false;
  }

  if (!validateEmail(data.email)) return false;
  if (!validateName(data.first_name)) return false;
  if (!validateName(data.last_name)) return false;
  
  if (data.grade && !['9', '10', '11', '12'].includes(data.grade)) return false;
  
  return true;
};

export const validateSeminarData = (data) => {
  if (!data) return false;
  
  const requiredFields = ['title', 'hour', 'capacity', 'teacher_email', 'teacher_name'];
  for (const field of requiredFields) {
    if (!data[field]) return false;
  }

  if (data.title.length < 3) return false;
  if (data.hour < 1 || data.hour > 8) return false;
  if (data.capacity < 1) return false;
  if (!validateEmail(data.teacher_email)) return false;
  if (!validateName(data.teacher_name)) return false;
  
  return true;
};

export const validateAttendanceData = (data) => {
  if (!data) return false;
  
  const requiredFields = ['student_id', 'seminar_id', 'date', 'attendance_code'];
  for (const field of requiredFields) {
    if (!data[field]) return false;
  }

  if (!['present', 'absent', 'tardy'].includes(data.status?.toLowerCase())) return false;
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) return false;
  
  return true;
};

export const validateRegistrationData = (data) => {
  if (!data) return false;
  
  const requiredFields = ['student_email', 'student_name', 'seminar_id', 'seminar_title'];
  for (const field of requiredFields) {
    if (!data[field]) return false;
  }

  if (!validateEmail(data.student_email)) return false;
  if (!validateName(data.student_name)) return false;
  if (typeof data.seminar_id !== 'number') return false;
  if (data.seminar_title.length < 3) return false;
  
  return true;
};
