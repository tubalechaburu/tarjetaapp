
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
      
      // Verificar usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error("No tienes acceso a esta información");
      }

      console.log("Current user:", userData.user.email);
      
      // Verificar si es superadmin usando la función RPC
      const { data: isSuperAdminResult, error: roleError } = await supabase
        .rpc('is_superadmin', { _user_id: userData.user.id });
      
      if (roleError) {
        console.error("Error checking superadmin status:", roleError);
        throw new Error("Error verificando permisos de administrador");
      }
      
      if (!isSuperAdminResult) {
        throw new Error("Solo los superadministradores pueden ver todos los usuarios");
      }
      
      console.log("Access granted for superadmin");
      
      // Get profiles from database - now with RLS policies in place
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, updated_at');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw new Error(`Error al obtener perfiles: ${profilesError.message}`);
      }
      
      console.log("Profiles fetched:", profiles?.length || 0);
      
      // Get user roles separately - now with RLS policies
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        throw new Error(`Error al obtener roles: ${rolesError.message}`);
      }
      
      console.log("User roles fetched:", userRoles?.length || 0);
      
      // Get all cards directly from cards table
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*');
        
      if (cardsError) {
        console.error("Error fetching cards:", cardsError);
        // Continue without cards if there's an error
        console.log("Continuing without cards data");
      }
      
      console.log("Cards fetched:", cards?.length || 0);
      
      // Combine data with improved user display
      const usersWithCards: UserWithCards[] = profiles?.map(profile => {
        const userCards = cards?.filter(card => card.user_id === profile.id) || [];
        const mappedCards = userCards.map(card => mapSupabaseToBusinessCard(card as unknown as SupabaseBusinessCard));
        
        // Get user role from user_roles table
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        const role = (userRole?.role as DatabaseRole) || 'user';
        
        // Garantizar que siempre tenemos un email y nombre visible
        const email = profile.email || 'Sin email';
        let fullName = profile.full_name;
        
        // Si no hay full_name, usar la parte antes del @ del email
        if (!fullName && email && email !== 'Sin email') {
          fullName = email.split('@')[0];
        }
        
        // Fallback final si no hay nombre
        if (!fullName) {
          fullName = 'Usuario sin nombre';
        }
        
        return {
          id: profile.id,
          full_name: fullName,
          email: email,
          role: role,
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
      console.log('Users data (with names and emails):', usersWithCards.map(u => ({ 
        name: u.full_name, 
        email: u.email, 
        cards: u.cards.length 
      })));
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
