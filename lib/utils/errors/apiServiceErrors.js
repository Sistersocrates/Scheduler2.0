
export const handleApiServiceError = (error, context = '') => {
  console.error(`API Service Error in ${context}:`, error);

  let message = 'An error occurred while communicating with an external service.';
  
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  if (error?.response?.status) {
    message = `Service returned status ${error.response.status}: ${message}`;
  }
  
  if (context) {
    return `API Service Error (${context}): ${message}`;
  }

  return message;
};
