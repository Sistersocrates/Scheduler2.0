
export const handleNotificationError = (error, context, details) => {
  console.error("Notification Error:", error, context, details);
  return `Notification Error in ${context}: ${error.message || "Failed to send or process a notification."} ${details ? JSON.stringify(details) : ''}`;
};
