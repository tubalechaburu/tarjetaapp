
import { useCallback } from "react";
import { toast } from "sonner";
import { sanitizeErrorMessage } from "@/utils/security/validation";

/**
 * Error categories para mejor clasificación y manejo
 */
export type ErrorCategory = 
  | 'authentication'
  | 'authorization' 
  | 'validation'
  | 'network'
  | 'server'
  | 'unknown';

/**
 * Interface para errores estructurados
 */
export interface AppError {
  message: string;
  category: ErrorCategory;
  originalError?: any;
  context?: string;
}

/**
 * Hook personalizado para manejo centralizado de errores
 * Proporciona métodos consistentes para manejar diferentes tipos de errores
 * 
 * @returns {Object} Métodos para manejar errores y mostrar notificaciones
 * 
 * @example
 * ```tsx
 * const { handleError, handleValidationError } = useErrorHandler();
 * 
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleError(error, 'Error al cargar datos');
 * }
 * ```
 */
export const useErrorHandler = () => {
  /**
   * Clasifica el error según su tipo y mensaje
   */
  const categorizeError = useCallback((error: any): ErrorCategory => {
    if (!error) return 'unknown';
    
    const message = error.message || error.toString() || '';
    
    if (message.includes('permission denied') || 
        message.includes('unauthorized') ||
        error.status === 401) {
      return 'authentication';
    }
    
    if (message.includes('forbidden') || 
        error.status === 403) {
      return 'authorization';
    }
    
    if (message.includes('validation') || 
        message.includes('invalid') ||
        error.status === 400) {
      return 'validation';
    }
    
    if (message.includes('network') || 
        message.includes('fetch') ||
        error.status >= 500) {
      return 'server';
    }
    
    if (error.status >= 400 && error.status < 500) {
      return 'network';
    }
    
    return 'unknown';
  }, []);

  /**
   * Maneja errores generales con notificación al usuario
   */
  const handleError = useCallback((
    error: any, 
    fallbackMessage: string = 'Ha ocurrido un error inesperado',
    context?: string
  ): AppError => {
    const category = categorizeError(error);
    const sanitizedMessage = sanitizeErrorMessage(error);
    
    const appError: AppError = {
      message: sanitizedMessage || fallbackMessage,
      category,
      originalError: error,
      context
    };

    // Mostrar notificación según la categoría del error
    switch (category) {
      case 'authentication':
        toast.error('Error de autenticación. Por favor, inicia sesión nuevamente.');
        break;
      case 'authorization':
        toast.error('No tienes permisos para realizar esta acción.');
        break;
      case 'validation':
        toast.error(appError.message);
        break;
      case 'network':
        toast.error('Error de conexión. Verifica tu conexión a internet.');
        break;
      case 'server':
        toast.error('Error del servidor. Inténtalo de nuevo más tarde.');
        break;
      default:
        toast.error(appError.message);
    }

    // Log para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', {
        category,
        message: appError.message,
        context,
        originalError: error
      });
    }

    return appError;
  }, [categorizeError]);

  /**
   * Maneja errores de validación específicamente
   */
  const handleValidationError = useCallback((
    validationErrors: Record<string, string[]>,
    fallbackMessage: string = 'Error de validación'
  ) => {
    const firstError = Object.values(validationErrors)[0]?.[0];
    toast.error(firstError || fallbackMessage);
  }, []);

  /**
   * Maneja errores de autenticación con redirección
   */
  const handleAuthError = useCallback((error: any) => {
    const appError = handleError(error, 'Error de autenticación');
    
    // Redireccionar a login si es necesario
    if (appError.category === 'authentication') {
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    }
    
    return appError;
  }, [handleError]);

  /**
   * Muestra mensaje de éxito
   */
  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  return {
    handleError,
    handleValidationError,
    handleAuthError,
    showSuccess,
    categorizeError
  };
};
