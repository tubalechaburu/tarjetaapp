
import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";

/**
 * Handles errors from Supabase operations
 */
export const handleSupabaseError = (error: any, messagePrefix: string): boolean => {
  console.error(`${messagePrefix}:`, error);
  toast.error(`${messagePrefix}`);
  return false;
};

/**
 * Handles successful Supabase operations with a toast notification
 */
export const handleSupabaseSuccess = (data: any, message: string): void => {
  console.log(`${message}:`, data);
  toast.success(message);
};

/**
 * Checks if data is empty or null
 */
export const isEmptyData = (data: any): boolean => {
  return !data || (Array.isArray(data) && data.length === 0);
};
