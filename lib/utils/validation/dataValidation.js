
// Data validation functions
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Allow letters (including accented), numbers, spaces, hyphens, apostrophes, periods. Min 1 char. Max 150.
  // This is a more permissive regex.
  const nameRegex = /^[a-zA-Z0-9À-ÿ\s'-.]{1,150}$/;
  return nameRegex.test(name.trim());
};

export const validateRole = (role) => {
  const validRoles = ['student', 'teacher', 'specialist', 'admin'];
  return validRoles.includes(role?.toLowerCase());
};

export const validatePassword = (password) => {
  if (!password) return false;
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return passwordRegex.test(password);
};

export const validateSession = (session) => {
  if (!session) return false;
  if (!session.user) return false;
  if (!session.user.email) return false;
  if (!session.access_token) return false;
  // refresh_token is not always present in every session object client-side, 
  // esp. after initial load or if session comes from storage.
  // if (!session.refresh_token) return false; 
  
  // Check token expiration
  const tokenExpiry = session.expires_at ? session.expires_at * 1000 : 0; // Convert to milliseconds
  if (tokenExpiry && Date.now() >= tokenExpiry) return false;
  
  return true;
};
