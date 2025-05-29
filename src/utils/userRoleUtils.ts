
import { supabase } from "@/integrations/supabase/client";

// Define the allowed roles based on the database schema
type DatabaseRole = 'user' | 'superadmin';

// Function to update a user's role directly in the profiles table
export const updateUserRole = async (
  userId: string, 
  role: DatabaseRole,
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    // Update the role directly in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);
        
    if (error) throw error;
    
    if (onSuccess) onSuccess();
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};
