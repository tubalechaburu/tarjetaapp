
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard, SupabaseBusinessCard } from "@/types";
import { UserWithCards } from "@/types/admin";
import { mapSupabaseToBusinessCard } from "@/utils/supabase/mappers";
import { useToast } from "@/components/ui/use-toast";

// Define the allowed roles based on the database schema
type DatabaseRole = 'user' | 'superadmin';

export const useUsersWithCards = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsersWithCards = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching users and cards...");
      
      // First check if current user is superadmin using the simplified function
      const { data: isSuperAdmin, error: roleError } = await supabase
        .rpc('is_current_user_superadmin');
      
      if (roleError) {
        console.error("Error checking superadmin status:", roleError);
        throw new Error("No tienes permisos para acceder a esta información");
      }
      
      if (!isSuperAdmin) {
        throw new Error("Solo los superadministradores pueden ver todos los usuarios");
      }
      
      // Get profiles from database
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name, created_at, updated_at');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Profiles fetched:", profiles?.length || 0);
      
      // Get all cards using the new function
      const { data: cards, error: cardsError } = await supabase.rpc('get_all_cards');
        
      if (cardsError) {
        console.error("Error fetching cards:", cardsError);
        throw cardsError;
      }
      
      console.log("Cards fetched:", cards?.length || 0);
      
      // Combine data
      const usersWithCards: UserWithCards[] = profiles?.map(profile => {
        const userCards = cards?.filter(card => card.user_id === profile.id) || [];
        const mappedCards = userCards.map(card => mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard));
        
        return {
          id: profile.id,
          full_name: profile.full_name || profile.email?.split('@')[0] || 'Usuario',
          email: profile.email,
          role: profile.role as DatabaseRole,
          cards: mappedCards,
          updated_at: profile.updated_at || ''
        };
      }) || [];
      
      // Sort by role (superadmin first, then user) and then by name
      usersWithCards.sort((a, b) => {
        const roleOrder = { superadmin: 0, user: 1 };
        const roleCompare = roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
        if (roleCompare !== 0) return roleCompare;
        return (a.full_name || '').localeCompare(b.full_name || '');
      });
      
      console.log('Final users with cards:', usersWithCards.length);
      setUsers(usersWithCards);
      
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
