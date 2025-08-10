
export const handleThirdPartyServiceError = (error, context, details) => {
  console.error("Third Party Service Error:", error, context, details);
  const serviceName = details?.serviceName || "a third-party service";
  return `Error with ${serviceName} in ${context}: ${error.message || `Failed to communicate with ${serviceName}.`} ${details ? JSON.stringify(details) : ''}`;
};
