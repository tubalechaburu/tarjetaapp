
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";
import { useToast } from "@/components/ui/use-toast";

// Function to update a user's role
export const updateUserRole = async (
  userId: string, 
  role: UserRole,
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    // Check if a role already exists for this user
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: role as UserRole })
        .eq('user_id', userId);
        
      if (error) throw error;
    } else {
      // Create a new role entry
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as UserRole
        });
        
      if (error) throw error;
    }
    
    if (onSuccess) onSuccess();
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

// Hook for fetching users with their roles
export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          updated_at
        `);
      
      if (error) throw error;
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Combine data
      const usersWithRoles = data.map(user => {
        const userRoles = rolesData.filter(role => role.user_id === user.id);
        const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
        return {
          ...user,
          role: roleName as UserRole
        };
      });
      
      setUsers(usersWithRoles);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast({
        title: "Error al cargar usuarios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, fetchUsers };
};

import { useState, useEffect } from "react";
