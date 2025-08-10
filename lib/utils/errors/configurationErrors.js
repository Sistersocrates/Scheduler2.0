
export const handleConfigurationError = (error, context, details) => {
  console.error("Configuration Error:", error, context, details);
  return `Configuration Error in ${context}: ${error.message || "A configuration issue occurred."} ${details ? JSON.stringify(details) : ''}`;
};
