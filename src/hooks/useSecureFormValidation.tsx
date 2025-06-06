
import { useState, useCallback } from "react";
import { validateEmail, validatePhone, validateUrl, sanitizeInput } from "@/utils/security/validation";

interface ValidationErrors {
  [key: string]: string[];
}

interface UseSecureFormValidationProps {
  initialValues: Record<string, any>;
  validationRules?: Record<string, (value: any) => string[]>;
}

export const useSecureFormValidation = ({ 
  initialValues, 
  validationRules = {} 
}: UseSecureFormValidationProps) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any): string[] => {
    const fieldErrors: string[] = [];

    // Apply custom validation rules
    if (validationRules[name]) {
      fieldErrors.push(...validationRules[name](value));
    }

    // Apply built-in security validations
    switch (name) {
      case 'email':
        if (value && !validateEmail(value)) {
          fieldErrors.push('Please enter a valid email address');
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          fieldErrors.push('Please enter a valid phone number');
        }
        break;
      case 'website':
        if (value && !validateUrl(value)) {
          fieldErrors.push('Please enter a valid URL (http:// or https://)');
        }
        break;
    }

    return fieldErrors;
  }, [validationRules]);

  const setValue = useCallback((name: string, value: any, maxLength?: number) => {
    // Sanitize input before setting
    const sanitizedValue = typeof value === 'string' 
      ? sanitizeInput(value, maxLength) 
      : value;

    setValues(prev => ({ ...prev, [name]: sanitizedValue }));

    // Validate field if it has been touched
    if (touched[name]) {
      const fieldErrors = validateField(name, sanitizedValue);
      setErrors(prev => ({ ...prev, [name]: fieldErrors }));
    }
  }, [validateField, touched]);

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field when touched
    const fieldErrors = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: fieldErrors }));
  }, [validateField, values]);

  const validateAll = useCallback((): boolean => {
    const allErrors: ValidationErrors = {};
    let hasErrors = false;

    Object.keys(values).forEach(name => {
      const fieldErrors = validateField(name, values[name]);
      if (fieldErrors.length > 0) {
        allErrors[name] = fieldErrors;
        hasErrors = true;
      }
    });

    setErrors(allErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return !hasErrors;
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldError = useCallback((name: string): string | undefined => {
    return errors[name]?.[0]; // Return first error for field
  }, [errors]);

  const hasFieldError = useCallback((name: string): boolean => {
    return !!(errors[name]?.length && touched[name]);
  }, [errors, touched]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    resetForm,
    getFieldError,
    hasFieldError,
  };
};
