
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard } from "./mappers";
import { isEmptyData } from "./helpers";
import { verifyAuthentication, checkSuperAdminStatus } from "./auth";

export const getCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Loading cards from Supabase...");
    
    const user = await verifyAuthentication();
    if (!user) return null;

    console.log("👤 User authenticated:", user.email);

    const isSuperAdmin = await checkSuperAdminStatus();
    console.log("🎭 Is superadmin:", isSuperAdmin);

    if (isSuperAdmin) {
      console.log("🔐 Superadmin detected, fetching all cards...");
      
      const { data: allCards, error: allCardsError } = await supabase.rpc('get_all_cards');
      
      if (allCardsError) {
        console.error("❌ Error fetching all cards:", allCardsError);
      } else if (allCards) {
        console.log("✅ All cards fetched for superadmin:", allCards.length);
        const mappedCards = allCards.map(item => mapSupabaseToBusinessCard(item as unknown as SupabaseBusinessCard));
        return mappedCards;
      }
    }
    
    console.log("👤 Fetching user's own cards...");
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error("❌ Database query error:", error);
      return null;
    }
    
    console.log("✅ User cards data:", data?.length || 0);
    
    if (isEmptyData(data)) {
      console.log("📭 No cards found for user");
      return [];
    }
    
    const mappedCards = (data as SupabaseBusinessCard[]).map(item => mapSupabaseToBusinessCard(item));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getCardsSupabase:", supabaseError);
    return null;
  }
};

export const getAllCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Admin loading all cards from Supabase...");
    
    const user = await verifyAuthentication();
    if (!user) return null;

    console.log("👤 User authenticated:", user.email);

    const isSuperAdmin = await checkSuperAdminStatus();

    if (!isSuperAdmin) {
      console.error("❌ User is not superadmin");
      return null;
    }

    console.log("🔐 Superadmin verified, fetching all cards...");
    
    const { data: allCards, error: allCardsError } = await supabase.rpc('get_all_cards');
    
    if (allCardsError) {
      console.error("❌ Error fetching all cards:", allCardsError);
      return null;
    }
    
    console.log("✅ All cards fetched:", allCards?.length || 0);
    
    if (!allCards || allCards.length === 0) {
      return [];
    }
    
    const mappedCards = allCards.map(item => mapSupabaseToBusinessCard(item as unknown as SupabaseBusinessCard));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getAllCardsSupabase:", supabaseError);
    return null;
  }
};
