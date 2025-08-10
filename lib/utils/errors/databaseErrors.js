
// Database-specific error handling
export const handleDatabaseError = (error) => {
  if (!error) return 'An unknown database error occurred';

  // Database error codes
  if (error.code) {
    switch (error.code) {
      // PostgreSQL error codes
      case 'PGRST116':
        return 'Resource not found. Please try again or contact support';
      case '23505':
        return 'This record already exists in the system';
      case '42P01':
        return 'Database table not found. Please contact support';
      case '42703':
        return 'Database column not found. Please contact support';
      case '23503':
        return 'This operation would break database relationships. Please check your data';
      case '23514':
        return 'Data validation failed. Please check your input';
      case 'PGRST301':
        return 'Database function returned an error. Please try again';
      case 'PGRST302':
        return 'Database function not found. Please contact support';
      case '23502':
        return 'Required field is missing. Please fill in all required fields';
      case '22001':
        return 'Value too long for field. Please use a shorter value';
      case '22003':
        return 'Numeric value out of range. Please check your input';
      case '22007':
        return 'Invalid date/time format. Please use correct format';
      case '22008':
        return 'Date/time field overflow. Please check your date values';
      case '22P02':
        return 'Invalid text representation. Please check your input format';
      case '23P01':
        return 'Database constraint violation. Please check your input';
      case '42601':
        return 'Syntax error in database operation. Please try again';
      case '42501':
        return 'Insufficient privileges for operation. Please contact support';
      case '42602':
        return 'Invalid name in database operation. Please check your input';
      case '42622':
        return 'Name too long in database operation. Please use a shorter name';
      case '42939':
        return 'Reserved name used in operation. Please use a different name';
      case '42P02':
        return 'Database parameter not found. Please contact support';
      default:
        return `Database error: ${error.message}`;
    }
  }

  // Database message patterns
  if (error.message?.toLowerCase().includes('connection')) {
    return 'Database connection error. Please try again later';
  }
  if (error.message?.toLowerCase().includes('timeout')) {
    return 'Database request timed out. Please try again';
  }
  if (error.message?.toLowerCase().includes('constraint')) {
    return 'This operation would violate database rules. Please check your input';
  }
  if (error.message?.toLowerCase().includes('duplicate')) {
    return 'This record already exists. Please check your input';
  }
  if (error.message?.toLowerCase().includes('foreign key')) {
    return 'Referenced record does not exist. Please check your input';
  }
  if (error.message?.toLowerCase().includes('not null')) {
    return 'Required field cannot be empty. Please fill in all required fields';
  }
  if (error.message?.toLowerCase().includes('unique')) {
    return 'This value must be unique. Please use a different value';
  }
  if (error.message?.toLowerCase().includes('check constraint')) {
    return 'Value does not meet requirements. Please check your input';
  }

  return 'Database error. Please try again later';
};

export const handleStorageError = (error) => {
  if (!error) return 'An unknown storage error occurred';

  if (error.code) {
    switch (error.code) {
      case 'storage/object-not-found':
        return 'File not found. Please try again';
      case 'storage/unauthorized':
        return 'You do not have permission to access this file';
      case 'storage/canceled':
        return 'File operation was canceled. Please try again';
      case 'storage/unknown':
        return 'An unknown error occurred. Please try again';
      case 'storage/invalid-checksum':
        return 'File is corrupted. Please try uploading again';
      case 'storage/retry-limit-exceeded':
        return 'Too many attempts. Please try again later';
      case 'storage/invalid-url':
        return 'Invalid file location. Please try again';
      case 'storage/invalid-argument':
        return 'Invalid file operation. Please try again';
      case 'storage/no-default-bucket':
        return 'Storage not configured. Please contact support';
      case 'storage/cannot-slice-blob':
        return 'File processing error. Please try again';
      case 'storage/server-file-wrong-size':
        return 'File size mismatch. Please try again';
      default:
        return `Storage error: ${error.message}`;
    }
  }

  // Storage message patterns
  if (error.message?.toLowerCase().includes('quota')) {
    return 'Storage quota exceeded. Please free up space or contact support';
  }
  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error during file operation. Please check your connection';
  }
  if (error.message?.toLowerCase().includes('permission')) {
    return 'Permission denied for file operation. Please check your access rights';
  }
  if (error.message?.toLowerCase().includes('format')) {
    return 'Invalid file format. Please check file requirements';
  }
  if (error.message?.toLowerCase().includes('size')) {
    return 'File size error. Please check size limits';
  }

  return 'Storage error. Please try again';
};

// Table-specific error handling
export const handleSeminarError = (error) => {
  if (!error) return 'An unknown seminar error occurred';

  if (error.message?.toLowerCase().includes('capacity')) {
    return 'Invalid seminar capacity. Please check the capacity limit';
  }
  if (error.message?.toLowerCase().includes('hour')) {
    return 'Invalid seminar hour. Please select a valid time slot';
  }
  if (error.message?.toLowerCase().includes('enrollment')) {
    return 'Error with enrollment count. Please try again';
  }
  if (error.message?.toLowerCase().includes('teacher')) {
    return 'Invalid teacher information. Please check teacher details';
  }
  if (error.message?.toLowerCase().includes('locked')) {
    return 'This seminar is locked and cannot be modified';
  }

  return 'Seminar operation failed. Please try again';
};

export const handleAttendanceError = (error) => {
  if (!error) return 'An unknown attendance error occurred';

  if (error.message?.toLowerCase().includes('code')) {
    return 'Invalid attendance code. Please check the code';
  }
  if (error.message?.toLowerCase().includes('date')) {
    return 'Invalid attendance date. Please check the date';
  }
  if (error.message?.toLowerCase().includes('status')) {
    return 'Invalid attendance status. Please select a valid status';
  }
  if (error.message?.toLowerCase().includes('time')) {
    return 'Invalid time slot. Please check the schedule';
  }

  return 'Attendance operation failed. Please try again';
};

export const handleRegistrationError = (error) => {
  if (!error) return 'An unknown registration error occurred';

  if (error.message?.toLowerCase().includes('full')) {
    return 'This seminar is full. Please try another seminar or join the waitlist';
  }
  if (error.message?.toLowerCase().includes('already')) {
    return 'You are already registered for this seminar';
  }
  if (error.message?.toLowerCase().includes('conflict')) {
    return 'Schedule conflict detected. Please check your schedule';
  }
  if (error.message?.toLowerCase().includes('closed')) {
    return 'Registration is closed for this seminar';
  }

  return 'Registration failed. Please try again';
};

export const handleWaitlistError = (error) => {
  if (!error) return 'An unknown waitlist error occurred';

  if (error.message?.toLowerCase().includes('position')) {
    return 'Error with waitlist position. Please try again';
  }
  if (error.message?.toLowerCase().includes('already')) {
    return 'You are already on the waitlist for this seminar';
  }
  if (error.message?.toLowerCase().includes('full')) {
    return 'Waitlist is full. Please try another seminar';
  }

  return 'Waitlist operation failed. Please try again';
};
