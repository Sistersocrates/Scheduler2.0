
// Supabase authentication-specific error handling
export const handleSupabaseAuthError = (error) => {
  if (!error) return 'An unknown authentication error occurred';

  // Supabase auth error codes
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/invalid-credential':
        return 'Invalid login credentials';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please try again later';
      case 'auth/popup-closed':
        return 'Login popup was closed. Please try again';
      case 'auth/cancelled':
        return 'Login was cancelled. Please try again';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/internal-error':
        return 'Authentication service error. Please try again';
      case 'auth/invalid-action-code':
        return 'Invalid authentication code. Please try again';
      case 'auth/invalid-api-key':
        return 'Authentication configuration error. Please contact support';
      case 'auth/invalid-tenant-id':
        return 'Invalid authentication setup. Please contact support';
      case 'auth/invalid-persistence-type':
        return 'Session persistence error. Please try again';
      case 'auth/invalid-oauth-provider':
        return 'Invalid OAuth provider. Please try again';
      case 'auth/invalid-oauth-client-id':
        return 'Invalid OAuth client. Please contact support';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for login';
      case 'auth/operation-not-supported':
        return 'This operation is not supported';
      default:
        return `Authentication error: ${error.message}`;
    }
  }

  // Supabase-specific error messages
  if (error.message?.toLowerCase().includes('jwt')) {
    return 'Session expired. Please log in again';
  }
  if (error.message?.toLowerCase().includes('token')) {
    return 'Invalid authentication token. Please log in again';
  }
  if (error.message?.toLowerCase().includes('credentials')) {
    return 'Invalid login credentials. Please try again';
  }
  if (error.message?.toLowerCase().includes('permission')) {
    return 'Access denied. Please check your permissions';
  }
  if (error.message?.toLowerCase().includes('provider')) {
    return 'Authentication provider error. Please try again';
  }
  if (error.message?.toLowerCase().includes('session')) {
    return 'Session error. Please log in again';
  }
  if (error.message?.toLowerCase().includes('timeout')) {
    return 'Authentication request timed out. Please try again';
  }
  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error during authentication. Please check your connection';
  }
  if (error.message?.toLowerCase().includes('cors')) {
    return 'Cross-origin request blocked. Please try again';
  }
  if (error.message?.toLowerCase().includes('oauth')) {
    return 'Google authentication error. Please try again';
  }

  return 'Authentication failed. Please try again';
};

export const validateSupabaseAuth = (session) => {
  if (!session) {
    throw new Error('No session data available');
  }

  if (!session.access_token) {
    throw new Error('Invalid session: missing access token');
  }

  if (!session.user) {
    throw new Error('Invalid session: missing user data');
  }

  if (!session.user.email) {
    throw new Error('Invalid session: missing user email');
  }

  if (!session.user.id) {
    throw new Error('Invalid session: missing user ID');
  }

  const tokenExpiry = new Date(session.expires_at * 1000);
  if (tokenExpiry < new Date()) {
    throw new Error('Session expired');
  }

  return true;
};

export const handleSupabaseAuthSuccess = (session) => {
  try {
    validateSupabaseAuth(session);
    return {
      success: true,
      message: 'Successfully authenticated',
      session
    };
  } catch (error) {
    throw new Error(handleSupabaseAuthError(error));
  }
};
