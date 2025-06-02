
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard } from "./mappers";

export const getAllCardsForAdmin = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Admin loading all cards from Supabase...");
    
    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email);

    // Verificar si es superadmin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single();

    if (userRole?.role !== 'superadmin') {
      console.error("❌ User is not superadmin");
      return null;
    }

    console.log("🔐 Superadmin verified, fetching all cards...");
    
    const { data: allCards, error: allCardsError } = await supabase
      .from('cards')
      .select('*');
    
    if (allCardsError) {
      console.error("❌ Error fetching all cards:", allCardsError);
      return null;
    }
    
    console.log("✅ All cards fetched:", allCards?.length || 0);
    
    if (!allCards || allCards.length === 0) {
      return [];
    }
    
    const mappedCards = allCards.map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getAllCardsForAdmin:", supabaseError);
    return null;
  }
};

export const checkSuperAdminAccess = async (): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return false;
    }

    // Check email for quick access
    if (userData.user.email === 'tubal@tubalechaburu.com') {
      return true;
    }

    // Check using RPC function
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('is_superadmin', { _user_id: userData.user.id });
    
    if (roleError) {
      console.error("❌ Error checking superadmin status:", roleError);
      return false;
    }

    return isSuperAdmin || false;
  } catch (error) {
    console.error("Error checking superadmin access:", error);
    return false;
  }
};
