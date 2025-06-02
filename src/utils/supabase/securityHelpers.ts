
import { supabase } from "@/integrations/supabase/client";

/**
 * Secure helper functions for authorization checks
 */

export const validateUserAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      return false;
    }

    // Use only secure database role checking
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('is_superadmin', { _user_id: userData.user.id });
    
    if (roleError) {
      console.error("❌ Error checking authorization:", roleError);
      return false;
    }

    // Allow access if user is accessing their own data or is superadmin
    return userData.user.id === userId || isSuperAdmin;
  } catch (error) {
    console.error("Error validating user access:", error);
    return false;
  }
};

export const sanitizeErrorMessage = (error: any): string => {
  // Sanitize error messages to prevent information disclosure
  if (typeof error === 'string') {
    if (error.includes('permission denied') || error.includes('PGRST116')) {
      return "Access denied. You don't have permission to perform this action.";
    }
    if (error.includes('violates row-level security')) {
      return "Access denied. Insufficient permissions.";
    }
    if (error.includes('duplicate key value')) {
      return "This action cannot be completed due to a conflict.";
    }
  }
  
  if (error?.message) {
    return sanitizeErrorMessage(error.message);
  }
  
  return "An error occurred. Please try again.";
};

export const validateInput = (input: string, maxLength: number = 1000): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  if (input.length > maxLength) {
    return false;
  }
  
  // Basic XSS prevention - reject inputs with script tags or javascript:
  const xssPattern = /<script|javascript:|on\w+\s*=/i;
  if (xssPattern.test(input)) {
    return false;
  }
  
  return true;
};
