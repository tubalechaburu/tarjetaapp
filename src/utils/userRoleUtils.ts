
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'user' | 'superadmin';

export const updateUserRole = async (
  userId: string, 
  newRole: UserRole, 
  onSuccess: () => void, 
  onError: (error: any) => void
) => {
  try {
    // Check if user role record exists
    const { data: existingRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is fine
      throw fetchError;
    }

    if (existingRole) {
      // Update existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: newRole 
        });

      if (insertError) {
        throw insertError;
      }
    }

    onSuccess();
  } catch (error) {
    console.error('Error updating user role:', error);
    onError(error);
  }
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No role found, return default
        return 'user';
      }
      throw error;
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};
