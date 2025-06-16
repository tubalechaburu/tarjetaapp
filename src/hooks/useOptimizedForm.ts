
import { useForm, UseFormProps, FieldValues, UseFormReturn } from "react-hook-form";
import { useMemo, useCallback } from "react";
import { useErrorHandler } from "./useErrorHandler";

/**
 * Configuración extendida para formularios optimizados
 */
interface OptimizedFormConfig<T extends FieldValues> extends UseFormProps<T> {
  onSubmitSuccess?: (data: T) => void;
  onSubmitError?: (error: any) => void;
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
}

/**
 * Hook optimizado para formularios que combina react-hook-form con 
 * manejo de errores centralizado y optimizaciones de rendimiento
 * 
 * @template T - Tipo de los datos del formulario
 * @param config - Configuración del formulario
 * @returns Objeto con métodos y estado del formulario optimizado
 * 
 * @example
 * ```tsx
 * const { form, handleSubmit, isSubmitting } = useOptimizedForm({
 *   defaultValues: { email: '', password: '' },
 *   onSubmitSuccess: (data) => console.log('Success:', data),
 *   onSubmitError: (error) => console.error('Error:', error)
 * });
 * ```
 */
export const useOptimizedForm = <T extends FieldValues>({
  onSubmitSuccess,
  onSubmitError,
  enableAutoSave = false,
  autoSaveDelay = 1000,
  ...formConfig
}: OptimizedFormConfig<T>) => {
  const { handleError, showSuccess } = useErrorHandler();
  
  // Configuración memoizada del formulario
  const memoizedConfig = useMemo(() => ({
    mode: 'onChange' as const,
    reValidateMode: 'onChange' as const,
    ...formConfig,
  }), [formConfig]);

  const form = useForm<T>(memoizedConfig);

  /**
   * Handler de submit optimizado con manejo de errores
   */
  const handleSubmit = useCallback(
    (onSubmit: (data: T) => Promise<void> | void) => {
      return form.handleSubmit(async (data: T) => {
        try {
          await onSubmit(data);
          onSubmitSuccess?.(data);
        } catch (error) {
          const appError = handleError(error, 'Error al procesar el formulario');
          onSubmitError?.(appError);
        }
      });
    },
    [form, handleError, onSubmitSuccess, onSubmitError]
  );

  /**
   * Resetea el formulario con valores opcionales
   */
  const resetForm = useCallback((values?: Partial<T>) => {
    form.reset(values);
  }, [form]);

  /**
   * Valida el formulario completo
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    return await form.trigger();
  }, [form]);

  /**
   * Obtiene valores del formulario de forma optimizada
   */
  const getFormValues = useCallback((): T => {
    return form.getValues();
  }, [form]);

  /**
   * Establece múltiples valores de forma optimizada
   */
  const setFormValues = useCallback((values: Partial<T>) => {
    Object.entries(values).forEach(([key, value]) => {
      form.setValue(key as keyof T, value);
    });
  }, [form]);

  /**
   * Estado derivado memoizado
   */
  const formState = useMemo(() => ({
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    touchedFields: form.formState.touchedFields,
  }), [form.formState]);

  return {
    form,
    handleSubmit,
    resetForm,
    validateForm,
    getFormValues,
    setFormValues,
    ...formState,
  };
};

/**
 * Hook para validación de campo individual optimizada
 */
export const useFieldValidation = <T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: keyof T
) => {
  const fieldError = form.formState.errors[fieldName];
  const isTouched = form.formState.touchedFields[fieldName];
  const fieldValue = form.watch(fieldName as string);

  const validationState = useMemo(() => ({
    hasError: !!fieldError && !!isTouched,
    errorMessage: fieldError?.message as string,
    isValid: !fieldError && !!isTouched && !!fieldValue,
  }), [fieldError, isTouched, fieldValue]);

  return validationState;
};
