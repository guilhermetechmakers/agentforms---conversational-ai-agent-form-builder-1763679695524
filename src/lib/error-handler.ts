import { toast } from 'sonner';
import { useLogError } from '@/hooks/useErrors';
import type { ErrorLogInsert, ErrorType } from '@/types/database/error-log';

/**
 * Error handler utility class
 */
export class ErrorHandler {
  /**
   * Get error type from error object
   */
  static getErrorType(error: Error | unknown): ErrorType {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('404') || message.includes('not found')) {
        return '404';
      }
      if (message.includes('500') || message.includes('server error')) {
        return '500';
      }
      if (message.includes('400') || message.includes('bad request')) {
        return '400';
      }
      if (message.includes('403') || message.includes('forbidden')) {
        return '403';
      }
      if (message.includes('network') || message.includes('fetch')) {
        return 'network';
      }
      if (message.includes('validation')) {
        return 'validation';
      }
    }
    return 'other';
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: Error | unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Network errors
      if (message.includes('network') || message.includes('fetch')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      }

      // 404 errors
      if (message.includes('404') || message.includes('not found')) {
        return 'The requested resource was not found. It may have been moved or deleted.';
      }

      // 500 errors
      if (message.includes('500') || message.includes('server error')) {
        return 'A server error occurred. Our team has been notified and is working on a fix.';
      }

      // 403 errors
      if (message.includes('403') || message.includes('forbidden')) {
        return 'You do not have permission to perform this action.';
      }

      // 400 errors
      if (message.includes('400') || message.includes('bad request')) {
        return 'Invalid request. Please check your input and try again.';
      }

      // Validation errors
      if (message.includes('validation')) {
        return 'Please check your input and ensure all required fields are filled correctly.';
      }

      // Return original message if it's user-friendly
      if (error.message.length < 100 && !error.message.includes('Error:')) {
        return error.message;
      }
    }

    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }

  /**
   * Log error to database
   */
  static async logError(
    error: Error | unknown,
    context?: {
      url?: string;
      userAgent?: string;
      additionalInfo?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const errorType = this.getErrorType(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;

      const errorLog: ErrorLogInsert = {
        error_type: errorType,
        url_attempted: context?.url || window.location.href,
        http_method: 'GET',
        status_code: errorType === '404' ? 404 : errorType === '500' ? 500 : null,
        error_message: errorMessage,
        stack_trace: stackTrace,
        user_agent: context?.userAgent || navigator.userAgent,
        additional_info: {
          ...context?.additionalInfo,
          timestamp: new Date().toISOString(),
        },
      };

      // Note: This would typically be called from a hook, but we provide the data structure
      // The actual logging should be done via useLogError hook in components
      console.error('Error logged:', errorLog);
    } catch (logError) {
      // Silently fail - we don't want to show errors when logging errors
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Handle error with toast notification
   */
  static handleError(
    error: Error | unknown,
    options?: {
      showToast?: boolean;
      toastMessage?: string;
      logError?: boolean;
      context?: {
        url?: string;
        userAgent?: string;
        additionalInfo?: Record<string, any>;
      };
    }
  ): string {
    const {
      showToast = true,
      toastMessage,
      logError: shouldLog = true,
      context,
    } = options || {};

    const userFriendlyMessage = toastMessage || this.getUserFriendlyMessage(error);

    if (showToast) {
      toast.error(userFriendlyMessage);
    }

    if (shouldLog) {
      this.logError(error, context);
    }

    return userFriendlyMessage;
  }

  /**
   * Create error handler function for async operations
   */
  static createErrorHandler(options?: {
    showToast?: boolean;
    toastMessage?: string;
    logError?: boolean;
    context?: {
      url?: string;
      userAgent?: string;
      additionalInfo?: Record<string, any>;
    };
  }) {
    return (error: Error | unknown) => {
      return this.handleError(error, options);
    };
  }
}

/**
 * React hook for error handling
 */
export function useErrorHandler() {
  const { mutate: logError } = useLogError();

  const handleError = (
    error: Error | unknown,
    options?: {
      showToast?: boolean;
      toastMessage?: string;
      logError?: boolean;
      context?: {
        url?: string;
        userAgent?: string;
        additionalInfo?: Record<string, any>;
      };
    }
  ): string => {
    const {
      showToast = true,
      toastMessage,
      logError: shouldLog = true,
      context,
    } = options || {};

    const userFriendlyMessage = toastMessage || ErrorHandler.getUserFriendlyMessage(error);

    if (showToast) {
      toast.error(userFriendlyMessage);
    }

    if (shouldLog) {
      const errorType = ErrorHandler.getErrorType(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stackTrace = error instanceof Error ? error.stack : undefined;

      logError({
        error_type: errorType,
        url_attempted: context?.url || window.location.href,
        http_method: 'GET',
        status_code: errorType === '404' ? 404 : errorType === '500' ? 500 : null,
        error_message: errorMessage,
        stack_trace: stackTrace,
        user_agent: context?.userAgent || navigator.userAgent,
        additional_info: {
          ...context?.additionalInfo,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return userFriendlyMessage;
  };

  return { handleError, ErrorHandler };
}
