
export const handleValidationError = (error, context, details) => {
  console.error("Validation Error:", error, context, details);
  const fieldErrors = error.errors || {}; 
  const messages = Object.values(fieldErrors).flat(); 
  const primaryMessage = messages.length > 0 ? messages.join(' ') : error.message || "Validation failed.";
  return `Validation Error in ${context}: ${primaryMessage} ${details ? JSON.stringify(details) : ''}`;
};

export const handleRoleError = (error, context, details) => {
  console.error("Role Error:", error, context, details);
  return `Role Error in ${context}: ${error.message || "Invalid role for this action."} ${details ? JSON.stringify(details) : ''}`;
};

export const handleStudentError = (error, context, details) => {
  console.error("Student Data Error:", error, context, details);
  return `Student Data Error in ${context}: ${error.message || "Problem with student data."} ${details ? JSON.stringify(details) : ''}`;
};

export const handleTeacherError = (error, context, details) => {
  console.error("Teacher Data Error:", error, context, details);
  return `Teacher Data Error in ${context}: ${error.message || "Problem with teacher data."} ${details ? JSON.stringify(details) : ''}`;
};

export const handleSpecialistError = (error, context, details) => {
  console.error("Specialist Data Error:", error, context, details);
  return `Specialist Data Error in ${context}: ${error.message || "Problem with specialist data."} ${details ? JSON.stringify(details) : ''}`;
};

export const handleFormError = (error, context, details) => {
  console.error("Form Submission Error:", error, context, details);
  return `Form Error in ${context}: ${error.message || "There was an issue with your form submission."} ${details ? JSON.stringify(details) : ''}`;
};

export const handleMissingFieldsError = (error, context, details) => {
  console.error("Missing Fields Error:", error, context, details);
  const missing = details?.fields || ['required fields'];
  return `Missing Fields Error in ${context}: Please provide ${missing.join(', ')}. ${error.message || ""}`;
};

export const handleInvalidFormatError = (error, context, details) => {
  console.error("Invalid Format Error:", error, context, details);
  const field = details?.field || 'A field';
  return `Invalid Format Error in ${context}: ${field} is not in the correct format. ${error.message || ""}`;
};
