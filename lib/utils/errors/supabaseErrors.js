
// Supabase-specific error handling
export const handleSupabaseError = (error, context = '') => {
  if (!error) return `An unknown database error occurred. Context: ${context}`;

  // Supabase error codes
  if (error.code) {
    switch (error.code) {
      case 'PGRST301': // PGRST_ROUTINE_NOT_FOUND (often for RPC) or PGRST_INVOKE_ERROR
        return `Database function error or not found. Context: ${context}. Message: ${error.message}`;
      case 'PGRST302':
        return `Database function not found. Please contact support. Context: ${context}. Message: ${error.message}`;
      case 'PGRST401':
        return `Authentication required. Please log in again. Context: ${context}. Message: ${error.message}`;
      case 'PGRST402':
        return `Invalid authentication. Please log in again. Context: ${context}. Message: ${error.message}`;
      case 'PGRST403':
        return `Insufficient permissions. Please check your access rights. Context: ${context}. Message: ${error.message}`;
      case 'PGRST404':
        return `Resource not found. Please try again. Context: ${context}. Message: ${error.message}`;
      case 'PGRST409':
        return `Conflict with existing data. Please check your input. Context: ${context}. Message: ${error.message}`;
      case 'PGRST429':
        return `Too many requests. Please try again later. Context: ${context}. Message: ${error.message}`;
      case 'PGRST500':
        return `Internal server error. Please try again later. Context: ${context}. Message: ${error.message}`;
      case 'PGRST503':
        return `Service unavailable. Please try again later. Context: ${context}. Message: ${error.message}`;
      case '23505': // unique_violation
        return `This item already exists or conflicts with an existing one. Context: ${context}. Details: ${error.details || error.message}`;
      case '23503': // foreign_key_violation
        return `A related record is missing or invalid. Context: ${context}. Details: ${error.details || error.message}`;
      case '23502': // not_null_violation
        return `A required field is missing. Context: ${context}. Details: ${error.details || error.message}`;
      default:
        return `Database error (${error.code}): ${error.message}. Context: ${context}`;
    }
  }

  // Supabase-specific error messages
  const lowerMessage = error.message?.toLowerCase() || '';
  if (lowerMessage.includes('jwt')) {
    return `Authentication token issue (e.g., expired). Please log in again. Context: ${context}`;
  }
  if (lowerMessage.includes('auth')) {
    return `Authentication error. Please log in again. Context: ${context}`;
  }
  if (lowerMessage.includes('policy')) {
    return `Access denied due to security policy. Please check your permissions. Context: ${context}`;
  }

  return `Database operation failed: ${error.message || 'Unknown reason'}. Context: ${context}`;
};

export const handleSupabaseQueryError = (error, context = '') => {
  if (!error) return `An unknown query error occurred. Context: ${context}`;
  const lowerMessage = error.message?.toLowerCase() || '';

  if (lowerMessage.includes('select')) {
    return `Error fetching data. Context: ${context}. Message: ${error.message}`;
  }
  if (lowerMessage.includes('insert')) {
    return `Error creating new record. Context: ${context}. Message: ${error.message}`;
  }
  if (lowerMessage.includes('update')) {
    return `Error updating record. Context: ${context}. Message: ${error.message}`;
  }
  if (lowerMessage.includes('delete')) {
    return `Error deleting record. Context: ${context}. Message: ${error.message}`;
  }
  if (lowerMessage.includes('join')) {
    return `Error combining data. Context: ${context}. Message: ${error.message}`;
  }

  return `Database query failed: ${error.message || 'Unknown reason'}. Context: ${context}`;
};

export const handleSupabaseTableError = (error, tableName, context = '') => {
  if (!error) return `An unknown table error occurred for ${tableName}. Context: ${context}`;
  const lowerMessage = error.message?.toLowerCase() || '';

  switch (tableName?.toLowerCase()) {
    case 'seminars':
      if (lowerMessage.includes('capacity')) {
        return `Invalid seminar capacity. Context: ${context}. Message: ${error.message}`;
      }
      if (lowerMessage.includes('enrollment')) {
        return `Error with enrollment count. Context: ${context}. Message: ${error.message}`;
      }
      if (lowerMessage.includes('teacher')) {
        return `Invalid teacher information. Context: ${context}. Message: ${error.message}`;
      }
      return `Seminar operation failed. Context: ${context}. Message: ${error.message}`;

    case 'students':
      if (lowerMessage.includes('grade')) {
        return `Invalid grade value. Context: ${context}. Message: ${error.message}`;
      }
      if (lowerMessage.includes('advisor')) {
        return `Invalid advisor information. Context: ${context}. Message: ${error.message}`;
      }
      return `Student operation failed. Context: ${context}. Message: ${error.message}`;

    case 'attendance':
      if (lowerMessage.includes('code')) {
        return `Invalid attendance code. Context: ${context}. Message: ${error.message}`;
      }
      if (lowerMessage.includes('status')) {
        return `Invalid attendance status. Context: ${context}. Message: ${error.message}`;
      }
      return `Attendance operation failed. Context: ${context}. Message: ${error.message}`;

    case 'registrations':
      if (lowerMessage.includes('duplicate') || error.code === '23505') {
        return `Already registered for this seminar. Context: ${context}. Message: ${error.message}`;
      }
      if (lowerMessage.includes('full')) {
        return `Seminar is full. Context: ${context}. Message: ${error.message}`;
      }
      return `Registration failed. Context: ${context}. Message: ${error.message}`;

    case 'waitlist':
      if (lowerMessage.includes('position')) {
        return `Error with waitlist position. Context: ${context}. Message: ${error.message}`;
      }
      if (lowerMessage.includes('duplicate') || error.code === '23505') {
        return `Already on waitlist for this seminar. Context: ${context}. Message: ${error.message}`;
      }
      return `Waitlist operation failed. Context: ${context}. Message: ${error.message}`;
    
    case 'users':
    case 'roles':
    case 'permissions':
    case 'tenants':
      if (error.code === '23505') { // unique_violation
         return `An account with this email or identifier already exists. Context: ${context}. Message: ${error.message}`;
      }
      return `User/Role/Permission/Tenant operation failed. Context: ${context}. Message: ${error.message}`;


    default:
      return `Database operation failed for table '${tableName}'. Context: ${context}. Message: ${error.message}`;
  }
};

export const handleSupabaseRelationError = (error, context = '') => {
  if (!error) return `An unknown relation error occurred. Context: ${context}`;
  const lowerMessage = error.message?.toLowerCase() || '';

  if (error.code === '23503' || lowerMessage.includes('foreign key')) {
    return `Referenced record does not exist or is invalid. Please check your data. Context: ${context}. Message: ${error.message}`;
  }
  if (error.code === '23505' || lowerMessage.includes('unique')) {
    return `This record already exists or violates a uniqueness constraint. Context: ${context}. Message: ${error.message}`;
  }
  if (error.code === '23502' || lowerMessage.includes('not null')) {
    return `Required field is missing. Please fill all required fields. Context: ${context}. Message: ${error.message}`;
  }
  if (error.code === '23514' || lowerMessage.includes('check constraint')) { // check_violation
    return `Value does not meet requirements (check constraint). Context: ${context}. Message: ${error.message}`;
  }

  return `Database relation error: ${error.message || 'Unknown reason'}. Context: ${context}`;
};

export const handleSupabaseRpcError = (error, context = '') => {
  if (!error) return `An unknown database function (RPC) error occurred. Context: ${context}`;
  
  const message = error.message || '';
  const code = error.code;

  if (code === 'PGRST301' || message.toLowerCase().includes('function') && message.toLowerCase().includes('not found')) {
    return `Database function error: The specified function could not be found or executed. Context: ${context}. Message: ${message}`;
  }
  
  if (message.toLowerCase().includes('permission denied for function')) {
    return `Database function error: Insufficient permissions to execute the function. Context: ${context}. Message: ${message}`;
  }

  return `Error executing database function: ${message}. Context: ${context}`;
};
