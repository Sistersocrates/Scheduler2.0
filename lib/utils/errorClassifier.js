
import { handleAuthError, handleSessionError, handleGoogleAuthError } from '@/lib/utils/errors/authErrors';
import { handleDatabaseError, handleStorageError } from '@/lib/utils/errors/databaseErrors';
import { handleValidationError, handleRoleError, handleStudentError, handleTeacherError, handleSpecialistError } from '@/lib/utils/errors/validationErrors';
import { handleNetworkError, handleRequestError, handleConnectionError } from '@/lib/utils/errors/networkErrors';
import { handleSupabaseError, handleSupabaseQueryError, handleSupabaseTableError, handleSupabaseRelationError, handleSupabaseRpcError } from '@/lib/utils/errors/supabaseErrors';
import { handleSupabaseAuthError } from '@/lib/utils/errors/supabaseAuthErrors';
import { handleSupabaseLoginError } from '@/lib/utils/errors/supabaseLoginErrors';
import { handleGenericError } from '@/lib/utils/errors/genericErrors';
import { handleApiServiceError } from '@/lib/utils/errors/apiServiceErrors';
import { handleFileOperationError } from '@/lib/utils/errors/fileOperationErrors';
import { handlePermissionError } from '@/lib/utils/errors/permissionErrors';
import { handleTimeoutError } from '@/lib/utils/errors/timeoutErrors';
import { handlePaymentError } from '@/lib/utils/errors/paymentErrors';
import { handleConfigurationError } from '@/lib/utils/errors/configurationErrors';
import { handleFeatureFlagError } from '@/lib/utils/errors/featureFlagErrors';
import { handleThirdPartyServiceError } from '@/lib/utils/errors/thirdPartyServiceErrors';
import { handleDataSyncError } from '@/lib/utils/errors/dataSyncErrors';
import { handleNotificationError } from '@/lib/utils/errors/notificationErrors';

export const classifyError = (error, context) => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || error?.name; 
  const errorStatus = error?.status;

  if (typeof navigator !== 'undefined' && !navigator.onLine) return { type: 'network', handler: handleNetworkError, details: { message: 'offline' } };
  if (errorMessage.includes('timeout') || errorCode === 'AbortError') return { type: 'timeout', handler: handleTimeoutError };
  if (errorMessage.includes('payment') || context?.toLowerCase().includes('payment')) return { type: 'payment', handler: handlePaymentError };
  if (errorMessage.includes('permission') || errorCode === '403' || errorStatus === 403) return { type: 'permission', handler: handlePermissionError };
  if (errorMessage.includes('file') || context?.toLowerCase().includes('file')) return { type: 'file', handler: handleFileOperationError };
  if (errorMessage.includes('config') || context?.toLowerCase().includes('config')) return { type: 'configuration', handler: handleConfigurationError };
  if (errorMessage.includes('feature flag') || context?.toLowerCase().includes('featureflag')) return { type: 'featureFlag', handler: handleFeatureFlagError };
  if (errorMessage.includes('third party') || context?.toLowerCase().includes('thirdparty')) return { type: 'thirdPartyService', handler: handleThirdPartyServiceError };
  if (errorMessage.includes('sync') || context?.toLowerCase().includes('sync')) return { type: 'dataSync', handler: handleDataSyncError };
  if (errorMessage.includes('notification') || context?.toLowerCase().includes('notification')) return { type: 'notification', handler: handleNotificationError };
  
  if (errorMessage.includes('api') && errorMessage.includes('service')) return { type: 'apiService', handler: handleApiServiceError };
  if (error.name === 'NetworkError' || errorMessage.includes('network')) return { type: 'network', handler: handleNetworkError };
  if (errorStatus || errorMessage.includes('request')) return { type: 'request', handler: handleRequestError };
  if (errorMessage.includes('connection')) return { type: 'connection', handler: handleConnectionError };

  const isSupabaseRelated = errorMessage.includes('supabase') || 
                            errorCode?.toString().startsWith('PGRST') || 
                            errorCode?.toString().startsWith('S000') ||
                            error?.details?.toLowerCase().includes('supabase') ||
                            context?.toLowerCase().includes('supabase');

  if (isSupabaseRelated) {
    if (errorMessage.includes('auth') || context?.toLowerCase().includes('supabaseauth')) return { type: 'supabaseAuth', handler: handleSupabaseAuthError };
    if (errorMessage.includes('login') || context?.toLowerCase().includes('supabaselogin')) return { type: 'supabaseLogin', handler: handleSupabaseLoginError };
    if (errorMessage.includes('query') || errorCode === 'PGRST116' || errorCode === 'PGRST100' ) return { type: 'supabaseQuery', handler: handleSupabaseQueryError };
    if (errorMessage.includes('table') || errorCode === '42P01') return { type: 'supabaseTable', handler: handleSupabaseTableError };
    if (errorMessage.includes('relation') || errorCode === '23503') return { type: 'supabaseRelation', handler: handleSupabaseRelationError };
    if (errorMessage.includes('rpc') || errorCode === 'PGRST301') return { type: 'supabaseRpc', handler: handleSupabaseRpcError };
    return { type: 'supabase', handler: handleSupabaseError };
  }

  if (errorCode?.toString().startsWith('auth/') || errorMessage.includes('auth')) return { type: 'auth', handler: handleAuthError };
  if (errorMessage.includes('session')) return { type: 'session', handler: handleSessionError };
  if (errorMessage.includes('google')) return { type: 'googleAuth', handler: handleGoogleAuthError };
  
  if (errorCode?.toString().startsWith('db_') || errorMessage.includes('database')) return { type: 'database', handler: handleDatabaseError };
  if (errorCode?.toString().startsWith('storage/')) return { type: 'storage', handler: handleStorageError };

  if (errorMessage.includes('validation') || error.name === 'ValidationError') return { type: 'validation', handler: handleValidationError };
  if (errorMessage.includes('role')) return { type: 'role', handler: handleRoleError };
  if (errorMessage.includes('student')) return { type: 'student', handler: handleStudentError };
  if (errorMessage.includes('teacher')) return { type: 'teacher', handler: handleTeacherError };
  if (errorMessage.includes('specialist')) return { type: 'specialist', handler: handleSpecialistError };
  
  if (error instanceof TypeError) return { type: 'typeError', handler: (e, ctx) => `Type Error in ${ctx}: ${e.message}` };
  if (error instanceof ReferenceError) return { type: 'referenceError', handler: (e, ctx) => `Reference Error in ${ctx}: ${e.message}` };
  if (error instanceof RangeError) return { type: 'rangeError', handler: (e, ctx) => `Range Error in ${ctx}: ${e.message}` };
  if (error instanceof SyntaxError && !isSupabaseRelated) return { type: 'syntaxError', handler: (e, ctx) => `Syntax Error in ${ctx}: ${e.message}` };


  return { type: 'generic', handler: handleGenericError };
};
