
export const handleGenericError = (error, context = '') => {
  console.error(`Generic error in ${context}:`, error);
  
  if (error instanceof TypeError) {
    return `Type error: ${error.message}. Please check the data format. Context: ${context}`;
  }
  if (error instanceof RangeError) {
    return `Range error: ${error.message}. An input value is out of bounds. Context: ${context}`;
  }
  if (error instanceof URIError) {
    return `URI error: ${error.message}. There was an issue with a web address. Context: ${context}`;
  }
  
  let message = 'An unexpected error occurred. Please try again';
  if (error && error.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  if (context) {
    return `Error in ${context}: ${message}`;
  }
  
  return message;
};
