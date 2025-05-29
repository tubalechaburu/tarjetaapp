
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
      
      // Get profiles from database
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, updated_at');
      
      if (profilesError) throw profilesError;
      
      // Get all cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
        
      if (cardsError) throw cardsError;
      
      // Combine data
      const usersWithCards: UserWithCards[] = profiles?.map(profile => {
        const userCards = cards?.filter(card => card.user_id === profile.id) || [];
        const mappedCards = userCards.map(card => mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard));
        
        return {
          id: profile.id,
          full_name: profile.email?.split('@')[0] || 'Usuario', // Use email prefix as name
          email: profile.email,
          role: profile.role as UserRole,
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
