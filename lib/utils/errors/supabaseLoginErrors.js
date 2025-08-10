
// Supabase login-specific error handling
export const handleSupabaseLoginError = (error) => {
  if (!error) return 'An unknown login error occurred';

  // Supabase auth-specific errors
  if (error.code?.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/invalid-login-credentials':
        return 'Invalid login credentials. Please try again';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support';
      case 'auth/user-not-found':
        return 'No account found. Please check your email or sign up';
      case 'auth/invalid-email':
        return 'Invalid email format. Please check your email';
      case 'auth/email-already-exists':
        return 'An account already exists with this email';
      case 'auth/invalid-session':
        return 'Your session has expired. Please log in again';
      case 'auth/invalid-provider-id':
        return 'Invalid authentication provider. Please try again';
      case 'auth/operation-not-allowed':
        return 'This login method is not enabled. Please try another method';
      case 'auth/provider-already-linked':
        return 'This account is already linked to another provider';
      case 'auth/requires-recent-login':
        return 'Please log in again to continue';
      default:
        return `Authentication error: ${error.message}`;
    }
  }

  // Database-specific login errors
  if (error.code?.startsWith('PGRST')) {
    switch (error.code) {
      case 'PGRST301':
        return 'Database error during login. Please try again';
      case 'PGRST401':
        return 'Authentication required. Please log in again';
      case 'PGRST403':
        return 'Access denied. Please check your permissions';
      case 'PGRST404':
        return 'User profile not found. Please contact support';
      case 'PGRST409':
        return 'Account conflict. Please contact support';
      case 'PGRST429':
        return 'Too many login attempts. Please try again later';
      case 'PGRST500':
        return 'Server error during login. Please try again';
      default:
        return 'Database error during login. Please try again';
    }
  }

  // Role-specific errors
  if (error.message?.toLowerCase().includes('role')) {
    if (error.message?.toLowerCase().includes('student')) {
      return 'Student role validation failed. Please try again';
    }
    if (error.message?.toLowerCase().includes('teacher')) {
      return 'Teacher role validation failed. Please try again';
    }
    if (error.message?.toLowerCase().includes('permission')) {
      return 'You do not have permission for this role';
    }
    return 'Role validation error. Please try again';
  }

  // Profile-specific errors
  if (error.message?.toLowerCase().includes('profile')) {
    if (error.message?.toLowerCase().includes('create')) {
      return 'Failed to create user profile. Please try again';
    }
    if (error.message?.toLowerCase().includes('update')) {
      return 'Failed to update user profile. Please try again';
    }
    if (error.message?.toLowerCase().includes('fetch')) {
      return 'Failed to fetch user profile. Please try again';
    }
    return 'Profile error during login. Please try again';
  }

  // Google OAuth specific errors
  if (error.message?.toLowerCase().includes('google')) {
    if (error.message?.toLowerCase().includes('token')) {
      return 'Google authentication token error. Please try again';
    }
    if (error.message?.toLowerCase().includes('consent')) {
      return 'Google consent required. Please grant the required permissions';
    }
    if (error.message?.toLowerCase().includes('scope')) {
      return 'Insufficient Google permissions. Please try again';
    }
    if (error.message?.toLowerCase().includes('popup')) {
      return 'Google login popup was closed. Please try again';
    }
    return 'Google authentication error. Please try again';
  }

  // Network-related errors
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network';
  }
  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error during login. Please check your connection';
  }
  if (error.message?.toLowerCase().includes('timeout')) {
    return 'Login request timed out. Please try again';
  }

  // Session-related errors
  if (error.message?.toLowerCase().includes('session')) {
    if (error.message?.toLowerCase().includes('expired')) {
      return 'Your session has expired. Please log in again';
    }
    if (error.message?.toLowerCase().includes('invalid')) {
      return 'Invalid session. Please log in again';
    }
    return 'Session error. Please log in again';
  }

  return 'Login failed. Please try again';
};

export const validateSupabaseLoginData = (data) => {
  if (!data) {
    throw new Error('No login data provided');
  }

  // Validate email
  if (!data.email) {
    throw new Error('Email is required');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email format');
  }

  // Validate name
  if (!data.name) {
    throw new Error('Name is required');
  }
  const nameRegex = /^[a-zA-Z\s'-]{2,100}$/;
  if (!nameRegex.test(data.name)) {
    throw new Error('Invalid name format');
  }

  // Validate role
  if (!data.role) {
    throw new Error('Role selection is required');
  }
  const validRoles = ['student', 'teacher'];
  if (!validRoles.includes(data.role.toLowerCase())) {
    throw new Error('Invalid role selected');
  }

  // Validate Google ID
  if (!data.sub) {
    throw new Error('Google ID is missing');
  }

  return true;
};

export const handleSupabaseLoginSuccess = (userData) => {
  try {
    validateSupabaseLoginData(userData);

    return {
      success: true,
      message: `Successfully logged in as ${userData.role}`,
      user: userData
    };
  } catch (error) {
    throw new Error(handleSupabaseLoginError(error));
  }
};
