
export const handlePermissionError = (error, context = '') => {
  const errorMessage = error?.message?.toLowerCase() || '';
  let specificMessage = 'You do not have permission to perform this action.';

  if (errorMessage.includes('access denied')) {
    specificMessage = 'Access Denied. You lack the necessary permissions.';
  } else if (errorMessage.includes('unauthorized')) {
    specificMessage = 'Unauthorized. Please log in or verify your credentials.';
  } else if (errorMessage.includes('forbidden')) {
    specificMessage = 'Forbidden. You are not allowed to access this resource or perform this action.';
  } else if (errorMessage.includes('role')) {
    specificMessage = 'Insufficient role privileges. Your current role does not permit this action.';
  }

  console.error(`Permission Error in ${context}: ${error.message}`, error);
  return `${specificMessage} (Context: ${context})`;
};
