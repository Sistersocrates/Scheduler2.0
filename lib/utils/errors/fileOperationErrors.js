
export const handleFileOperationError = (error, context = '') => {
  const errorMessage = error?.message?.toLowerCase() || '';
  let specificMessage = 'A file operation error occurred.';

  if (errorMessage.includes('not found') || error.code === 'ENOENT') {
    specificMessage = 'File not found. Please check the file path and try again.';
  } else if (errorMessage.includes('permission denied') || error.code === 'EACCES') {
    specificMessage = 'Permission denied. Unable to access the file or directory.';
  } else if (errorMessage.includes('read error') || error.code === 'EREAD') {
    specificMessage = 'Error reading file. The file might be corrupted or unreadable.';
  } else if (errorMessage.includes('write error') || error.code === 'EWRITE') {
    specificMessage = 'Error writing to file. Ensure there is enough space and permissions are correct.';
  } else if (errorMessage.includes('type not supported') || errorMessage.includes('invalid format')) {
    specificMessage = 'Unsupported file type or invalid file format.';
  } else if (errorMessage.includes('too large')) {
    specificMessage = 'File is too large. Please select a smaller file.';
  }

  console.error(`File Operation Error in ${context}: ${error.message}`, error);
  return `${specificMessage} (Context: ${context})`;
};
