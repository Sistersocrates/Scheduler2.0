
import { classifyError } from '@/lib/utils/errorClassifier';

export const handleError = (error, context = 'Application') => {
  console.error(`Error in ${context}:`, error, error?.stack, error?.details);

  const errorClassification = classifyError(error, context);
  
  return errorClassification.handler(error, context, errorClassification.details);
};

export * from '@/lib/utils/validation/dataValidation';
export * from '@/lib/utils/validation/entityValidation';
