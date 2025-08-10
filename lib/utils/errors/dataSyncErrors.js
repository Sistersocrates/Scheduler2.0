
export const handleDataSyncError = (error, context, details) => {
  console.error("Data Sync Error:", error, context, details);
  return `Data Synchronization Error in ${context}: ${error.message || "Failed to synchronize data."} ${details ? JSON.stringify(details) : ''}`;
};
