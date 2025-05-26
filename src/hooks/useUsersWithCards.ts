
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard, SupabaseBusinessCard, UserRole } from "@/types";
import { UserWithCards } from "@/types/admin";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";
import { useToast } from "@/components/ui/use-toast";

export const useUsersWithCards = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsersWithCards = async () => {
    try {
      setLoading(true);
      
      // Get users from profiles table with proper email field
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, updated_at');
      
      if (profilesError) throw profilesError;
      
      // Get auth users to get actual email addresses
      let authUsers: any[] = [];
      try {
        const { data, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          console.warn('Could not fetch auth users:', authError);
        } else {
          authUsers = data?.users || [];
        }
      } catch (authFetchError) {
        console.warn('Failed to fetch auth users:', authFetchError);
      }
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Get all cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
        
      if (cardsError) throw cardsError;
      
      // Combine data
      const usersWithCards: UserWithCards[] = profiles.map(profile => {
        const userRoles = rolesData?.filter(role => role.user_id === profile.id) || [];
        const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
        const userCards = cards?.filter(card => card.user_id === profile.id) || [];
        const mappedCards = userCards.map(card => mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard));
        
        // Get email from auth users if available, otherwise from profile
        const authUser = authUsers.find(user => user.id === profile.id);
        const emailToShow = authUser?.email || profile.email || profile.id;
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: emailToShow,
          role: roleName as UserRole,
          cards: mappedCards,
          updated_at: profile.updated_at || ''
        };
      });
      
      // Sort by role (superadmin first, then admin, then user) and then by name
      usersWithCards.sort((a, b) => {
        const roleOrder = { superadmin: 0, admin: 1, user: 2 };
        const roleCompare = roleOrder[a.role] - roleOrder[b.role];
        if (roleCompare !== 0) return roleCompare;
        return (a.full_name || '').localeCompare(b.full_name || '');
      });
      
      setUsers(usersWithCards);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching users with cards:', error);
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
    fetchUsersWithCards();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsersWithCards
  };
};
