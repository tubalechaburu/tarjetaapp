
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

// Function to update a user's role directly in the profiles table
export const updateUserRole = async (
  userId: string, 
  role: UserRole,
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    // Update the role directly in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ role: role as UserRole })
      .eq('id', userId);
        
    if (error) throw error;
    
    if (onSuccess) onSuccess();
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};
