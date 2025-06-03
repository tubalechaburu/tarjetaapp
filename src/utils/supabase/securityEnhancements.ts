
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced security validation functions
 */

export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula");
  }
  
  if (!/\d/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("La contraseña debe contener al menos un carácter especial");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeUserInput = (input: string, maxLength: number = 500): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potential XSS vectors
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
  
  // Limit length
  return sanitized.substring(0, maxLength);
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.'
    };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

export const validateURL = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};
