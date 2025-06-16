
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Componente Error Boundary para capturar errores de JavaScript en cualquier lugar
 * del árbol de componentes hijos y mostrar una UI de fallback en lugar de 
 * hacer que toda la aplicación se bloquee.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Se ejecuta cuando hay un error en cualquier componente hijo
   * @param error - El error que ocurrió
   * @returns El nuevo estado con información del error
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Se ejecuta después de que un error haya sido capturado
   * Útil para logging y reportes de errores
   * @param error - El error que ocurrió
   * @param errorInfo - Información adicional sobre el error
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Aquí se podría enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Ejemplo: Sentry.captureException(error);
    }
  }

  /**
   * Reinicia el estado de error para intentar volver a renderizar
   */
  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * Recarga completamente la página
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
              <AlertDescription>
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página
                o contacta con soporte si el problema persiste.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar de nuevo
              </Button>
              
              <Button 
                onClick={this.handleReload}
                className="flex-1"
              >
                Recargar página
              </Button>
            </div>

            {/* Mostrar detalles del error solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
                <summary className="cursor-pointer font-medium text-red-600">
                  Detalles del error (solo visible en desarrollo)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary de forma funcional
 * Útil cuando necesitas capturar errores en componentes específicos
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { captureError } = useErrorBoundary();
 *   
 *   const handleAsyncError = async () => {
 *     try {
 *       await riskyOperation();
 *     } catch (error) {
 *       captureError(error);
 *     }
 *   };
 * };
 * ```
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError };
};

export default ErrorBoundary;
