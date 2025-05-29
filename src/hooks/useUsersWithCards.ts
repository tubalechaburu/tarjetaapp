
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

  const createMissingProfiles = async (authUsers: any[]) => {
    try {
      // Get existing profiles
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id');
      
      const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
      
      // Find auth users without profiles
      const missingProfiles = authUsers.filter(user => !existingProfileIds.has(user.id));
      
      if (missingProfiles.length > 0) {
        console.log('Creating missing profiles for users:', missingProfiles.map(u => u.email));
        
        // Create missing profiles
        const newProfiles = missingProfiles.map(user => ({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: user.user_metadata?.phone || null,
          website: user.user_metadata?.website || null,
          linkedin: user.user_metadata?.linkedin || null,
          company: user.user_metadata?.company || null,
          job_title: user.user_metadata?.job_title || null,
          description: user.user_metadata?.description || null,
          address: user.user_metadata?.address || null,
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfiles);
          
        if (insertError) {
          console.error('Error creating missing profiles:', insertError);
        } else {
          console.log('Successfully created missing profiles');
        }
      }
    } catch (error) {
      console.error('Error in createMissingProfiles:', error);
    }
  };

  const fetchUsersWithCards = async () => {
    try {
      setLoading(true);
      
      // Get auth users first
      let authUsers: any[] = [];
      try {
        const { data, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          console.warn('Could not fetch auth users:', authError);
        } else {
          authUsers = data?.users || [];
          console.log('Found auth users:', authUsers.length);
        }
      } catch (authFetchError) {
        console.warn('Failed to fetch auth users:', authFetchError);
      }
      
      // Create missing profiles
      if (authUsers.length > 0) {
        await createMissingProfiles(authUsers);
      }
      
      // Get profiles from database (should include newly created ones)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, updated_at');
      
      if (profilesError) throw profilesError;
      
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
      
      // Combine data - prioritize profiles, but include auth users without profiles
      const usersWithCards: UserWithCards[] = [];
      
      // Add users from profiles
      profiles.forEach(profile => {
        const userRoles = rolesData?.filter(role => role.user_id === profile.id) || [];
        const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
        const userCards = cards?.filter(card => card.user_id === profile.id) || [];
        const mappedCards = userCards.map(card => mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard));
        
        // Get email from auth users if available, otherwise from profile
        const authUser = authUsers.find(user => user.id === profile.id);
        const emailToShow = authUser?.email || profile.email || profile.id;
        
        usersWithCards.push({
          id: profile.id,
          full_name: profile.full_name,
          email: emailToShow,
          role: roleName as UserRole,
          cards: mappedCards,
          updated_at: profile.updated_at || ''
        });
      });
      
      // Add any remaining auth users that don't have profiles (fallback)
      authUsers.forEach(authUser => {
        if (!usersWithCards.find(user => user.id === authUser.id)) {
          const userRoles = rolesData?.filter(role => role.user_id === authUser.id) || [];
          const roleName = userRoles.length > 0 ? userRoles[0].role : 'user';
          const userCards = cards?.filter(card => card.user_id === authUser.id) || [];
          const mappedCards = userCards.map(card => mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard));
          
          usersWithCards.push({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
            email: authUser.email || authUser.id,
            role: roleName as UserRole,
            cards: mappedCards,
            updated_at: authUser.created_at || ''
          });
        }
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
      
      console.log('Final users with cards:', usersWithCards.length);
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
