
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard } from "./mappers";
import { sanitizeErrorMessage } from "./securityHelpers";

export const getAllCardsForAdmin = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Admin loading all cards from Supabase...");
    
    // Secure authentication check
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email);

    // Use secure RLS policies - they will automatically filter based on user permissions
    console.log("🔐 Checking superadmin access via secure RLS policies...");
    
    const { data: allCards, error: allCardsError } = await supabase
      .from('cards')
      .select('*');
    
    if (allCardsError) {
      console.error("❌ Error fetching cards:", sanitizeErrorMessage(allCardsError));
      return null;
    }
    
    console.log("✅ Cards fetched (RLS-filtered):", allCards?.length || 0);
    
    if (!allCards || allCards.length === 0) {
      return [];
    }
    
    const mappedCards = allCards.map(item => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getAllCardsForAdmin:", sanitizeErrorMessage(supabaseError));
    return null;
  }
};

export const checkSuperAdminAccess = async (): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return false;
    }

    // Use the secure database function for role checking
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('is_superadmin', { _user_id: userData.user.id });
    
    if (roleError) {
      console.error("❌ Error checking superadmin status:", sanitizeErrorMessage(roleError));
      return false;
    }

    return isSuperAdmin || false;
  } catch (error) {
    console.error("Error checking superadmin access:", sanitizeErrorMessage(error));
    return false;
  }
};
