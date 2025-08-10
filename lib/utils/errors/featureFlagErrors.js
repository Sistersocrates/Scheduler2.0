
export const handleFeatureFlagError = (error, context, details) => {
  console.error("Feature Flag Error:", error, context, details);
  return `Feature Flag Error in ${context}: ${error.message || "Problem with a feature flag."} ${details ? JSON.stringify(details) : ''}`;
};
