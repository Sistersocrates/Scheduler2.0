
// Network-specific error handling
export const handleNetworkError = (error) => {
  if (!error) return 'An unknown network error occurred';

  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again';
  }

  if (error.message?.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again';
  }

  if (error.message?.toLowerCase().includes('cors')) {
    return 'Cross-origin request blocked. Please try again later';
  }

  if (error.message?.toLowerCase().includes('offline')) {
    return 'You are currently offline. Please check your internet connection';
  }

  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error occurred. Please check your connection';
  }

  if (error.message?.toLowerCase().includes('failed to fetch')) {
    return 'Failed to connect to the server. Please try again later';
  }

  return 'Network error. Please check your connection and try again';
};

export const handleRequestError = (error) => {
  if (!error) return 'An unknown request error occurred';

  // HTTP status code handling
  if (error.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input';
      case 401:
        return 'Unauthorized. Please log in again';
      case 403:
        return 'Access denied. You do not have permission to perform this action';
      case 404:
        return 'Resource not found. Please try again';
      case 408:
        return 'Request timeout. Please try again';
      case 409:
        return 'Conflict with existing data. Please check your input';
      case 413:
        return 'Request too large. Please try with less data';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Please try again later';
      case 502:
        return 'Bad gateway. Please try again later';
      case 503:
        return 'Service unavailable. Please try again later';
      case 504:
        return 'Gateway timeout. Please try again later';
      default:
        return `Request failed with status ${error.status}. Please try again`;
    }
  }

  // Request-specific errors
  if (error.message?.toLowerCase().includes('aborted')) {
    return 'Request was cancelled. Please try again';
  }
  if (error.message?.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again';
  }
  if (error.message?.toLowerCase().includes('payload')) {
    return 'Invalid request data. Please check your input';
  }

  return 'Request failed. Please try again';
};

export const handleConnectionError = (error) => {
  if (!error) return 'An unknown connection error occurred';

  if (error.message?.toLowerCase().includes('websocket')) {
    return 'Real-time connection failed. Please refresh the page';
  }
  if (error.message?.toLowerCase().includes('connection refused')) {
    return 'Connection refused. Please try again later';
  }
  if (error.message?.toLowerCase().includes('connection reset')) {
    return 'Connection was reset. Please try again';
  }
  if (error.message?.toLowerCase().includes('connection timeout')) {
    return 'Connection timed out. Please try again';
  }

  return 'Connection error. Please check your network and try again';
};
