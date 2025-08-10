
// Authentication-specific error handling
export const handleAuthError = (error) => {
  if (!error) return 'An unknown authentication error occurred';

  // Auth error codes
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or sign up';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password';
      case 'auth/invalid-credential':
        return 'Invalid login credentials. Please check your email and password';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again';
      case 'auth/cancelled-popup-request':
        return 'Only one popup can be open at a time. Please try again';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked. Please allow popups and try again';
      default:
        return `Authentication error: ${error.message}`;
    }
  }

  // Auth message patterns
  if (error.message?.toLowerCase().includes('token')) {
    return 'Authentication token is invalid. Please log in again';
  }
  if (error.message?.toLowerCase().includes('permission')) {
    return 'You do not have permission to perform this action';
  }
  if (error.message?.toLowerCase().includes('provider')) {
    return 'Authentication provider error. Please try again';
  }

  return 'Authentication failed. Please try logging in again';
};

export const handleSessionError = (error) => {
  if (!error) return 'An unknown session error occurred';

  if (error.message?.toLowerCase().includes('expired')) {
    return 'Your session has expired. Please log in again';
  }
  if (error.message?.toLowerCase().includes('invalid')) {
    return 'Invalid session. Please log in again';
  }
  if (error.message?.toLowerCase().includes('missing')) {
    return 'No active session found. Please log in';
  }
  if (error.message?.toLowerCase().includes('token')) {
    return 'Session token is invalid. Please log in again';
  }

  return 'Session error. Please try logging in again';
};

export const handleGoogleAuthError = (error) => {
  if (!error) return 'An unknown Google sign-in error occurred';

  if (error.message?.toLowerCase().includes('popup')) {
    return 'Google sign-in popup was closed. Please try again';
  }
  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error during Google sign-in. Please check your connection';
  }
  if (error.message?.toLowerCase().includes('cancelled')) {
    return 'Google sign-in was cancelled. Please try again';
  }
  if (error.message?.toLowerCase().includes('cookies')) {
    return 'Please enable cookies to sign in with Google';
  }

  return 'Error signing in with Google. Please try again';
};
