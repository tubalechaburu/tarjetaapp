
import { toast } from "sonner";

export const handleSupabaseError = (error: any, fallbackMessage: string): boolean => {
  console.error("Supabase operation failed:", error);
  toast.error(fallbackMessage);
  return false;
};

export const handleSupabaseSuccess = (data: any, message: string): void => {
  console.log("Supabase operation successful:", data);
  toast.success(message);
};

export const isEmptyData = (data: any): boolean => {
  return !data || (Array.isArray(data) && data.length === 0);
};
