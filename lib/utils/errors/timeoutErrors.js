
export const handleTimeoutError = (error, context = '') => {
  const errorMessage = error?.message?.toLowerCase() || '';
  let specificMessage = 'The operation timed out. Please try again.';

  if (errorMessage.includes('request timeout')) {
    specificMessage = 'The request timed out. The server might be busy or unreachable.';
  } else if (errorMessage.includes('connection timeout')) {
    specificMessage = 'Connection timed out. Please check your internet connection.';
  } else if (error.name === 'AbortError') {
     specificMessage = 'The operation was aborted, possibly due to a timeout or user action.';
  }


  console.error(`Timeout Error in ${context}: ${error.message}`, error);
  return `${specificMessage} (Context: ${context})`;
};
