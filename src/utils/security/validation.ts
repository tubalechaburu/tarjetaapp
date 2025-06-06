
// Security validation utilities
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Basic email validation with security considerations
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Additional security checks
  if (email.length > 254) return false; // RFC 5321 limit
  if (email.includes('..')) return false; // No consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Allow international formats, digits, spaces, hyphens, parentheses, plus
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and limit length
  let sanitized = input
    .slice(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, ''); // Remove data: URIs
  
  return sanitized.trim();
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const sanitizeErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const message = typeof error === 'string' ? error : error.message || '';
  
  // Don't expose sensitive technical details
  const sensitivePatterns = [
    /permission denied/i,
    /violates row-level security/i,
    /duplicate key value/i,
    /constraint violation/i,
    /relation ".*" does not exist/i,
    /column ".*" does not exist/i,
    /function ".*" does not exist/i
  ];
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(message)) {
      return 'Access denied or invalid operation';
    }
  }
  
  // Rate limiting errors
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many requests. Please wait before trying again.';
  }
  
  // Card limit errors
  if (message.includes('card limit') || message.includes('Card limit')) {
    return 'You have reached your card creation limit.';
  }
  
  // Authentication errors
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password.';
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }
  
  // Generic sanitized message for other errors
  return 'An error occurred. Please try again.';
};
