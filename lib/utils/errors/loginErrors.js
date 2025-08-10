
// Login-specific error handling
export const handleLoginError = (error) => {
  if (!error) return 'An unknown login error occurred';

  // Google OAuth specific errors
  if (error.message?.toLowerCase().includes('google')) {
    if (error.message?.toLowerCase().includes('access_token')) {
      return 'Failed to get Google access token. Please try again';
    }
    if (error.message?.toLowerCase().includes('userinfo')) {
      return 'Failed to fetch Google user information. Please try again';
    }
    if (error.message?.toLowerCase().includes('consent')) {
      return 'Google consent was not granted. Please allow the required permissions';
    }
    if (error.message?.toLowerCase().includes('scope')) {
      return 'Required Google permissions are missing. Please try again';
    }
    return 'Google sign-in failed. Please try again';
  }

  // Role selection errors
  if (error.message?.toLowerCase().includes('role')) {
    if (error.message?.toLowerCase().includes('select')) {
      return 'Please select a role (Student or Teacher) before logging in';
    }
    if (error.message?.toLowerCase().includes('invalid')) {
      return 'Invalid role selected. Please choose either Student or Teacher';
    }
    if (error.message?.toLowerCase().includes('permission')) {
      return 'You do not have permission for the selected role';
    }
    return 'Role selection error. Please try again';
  }

  // Student profile errors
  if (error.message?.toLowerCase().includes('student')) {
    if (error.message?.toLowerCase().includes('create')) {
      return 'Failed to create student profile. Please try again';
    }
    if (error.message?.toLowerCase().includes('update')) {
      return 'Failed to update student profile. Please try again';
    }
    if (error.message?.toLowerCase().includes('data')) {
      return 'Invalid student data. Please check your information';
    }
    return 'Student profile error. Please try again';
  }

  // Session errors
  if (error.message?.toLowerCase().includes('session')) {
    if (error.message?.toLowerCase().includes('expired')) {
      return 'Your session has expired. Please log in again';
    }
    if (error.message?.toLowerCase().includes('invalid')) {
      return 'Invalid session. Please log in again';
    }
    return 'Session error. Please try logging in again';
  }

  // Network errors during login
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again';
  }
  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error during login. Please check your connection';
  }
  if (error.message?.toLowerCase().includes('timeout')) {
    return 'Login request timed out. Please try again';
  }

  // Name validation errors
  if (error.message?.toLowerCase().includes('name')) {
    if (error.message?.toLowerCase().includes('format')) {
      return 'Invalid name format. Please use only letters, spaces, hyphens, apostrophes, or periods';
    }
    if (error.message?.toLowerCase().includes('required')) {
      return 'Name is required. Please enter your name';
    }
    if (error.message?.toLowerCase().includes('length')) {
      return 'Name is too long. Please use a shorter name';
    }
    return 'Please check your name and try again';
  }

  // Email validation errors
  if (error.message?.toLowerCase().includes('email')) {
    return 'Invalid email format. Please check your email';
  }

  // Storage errors
  if (error.message?.toLowerCase().includes('storage')) {
    if (error.message?.toLowerCase().includes('local')) {
      return 'Failed to save login data. Please check your browser settings';
    }
    return 'Storage error during login. Please try again';
  }

  return 'Login failed. Please try again';
};

export const validateLoginData = (data) => {
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

  // Validate name with more inclusive regex
  if (!data.name) {
    throw new Error('Name is required');
  }
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-.,]{1,100}$/;
  if (!nameRegex.test(data.name.trim())) {
    throw new Error('Invalid name format. Please use only letters, spaces, hyphens, apostrophes, or periods');
  }

  // Validate role
  if (!data.role) {
    throw new Error('Please select a role');
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

export const handleLoginSuccess = (userData) => {
  try {
    // Validate login data
    validateLoginData(userData);

    // Save user data to local storage
    localStorage.setItem('user', JSON.stringify(userData));

    return {
      success: true,
      message: `Successfully logged in as ${userData.role}`,
      user: userData
    };
  } catch (error) {
    throw new Error(handleLoginError(error));
  }
};
