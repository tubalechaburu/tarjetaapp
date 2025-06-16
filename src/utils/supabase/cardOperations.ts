
import { BusinessCard } from "../../types";
import { toast } from "sonner";
import { supabase } from "../../integrations/supabase/client";
import { 
  saveCardToSupabase, 
  getUserCardsFromSupabase, 
  getCardByIdFromSupabase, 
  deleteCardFromSupabase 
} from "./coreOperations";
import { getAllCardsForAdmin, checkSuperAdminAccess } from "./adminOperations";

export const saveCardSupabase = saveCardToSupabase;
export const deleteCardSupabase = deleteCardFromSupabase;
export const getCardByIdSupabase = getCardByIdFromSupabase;
export const getAllCardsSupabase = getAllCardsForAdmin;

export const getCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Loading cards from Supabase...");
    
    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email, "User ID:", userData.user.id);

    // Check if user is superadmin
    const isSuperAdmin = await checkSuperAdminAccess();
    console.log("🎭 Is superadmin:", isSuperAdmin);

    // If superadmin, get all cards
    if (isSuperAdmin) {
      console.log("🔐 Superadmin detected, fetching all cards...");
      return await getAllCardsForAdmin();
    }
    
    // For regular users, get only their cards with explicit user_id filter
    console.log("👤 Regular user, fetching own cards for user ID:", userData.user.id);
    const userCards = await getUserCardsFromSupabase(userData.user.id);
    
    if (userCards) {
      console.log("✅ User cards loaded:", userCards.length, "cards found");
      userCards.forEach(card => {
        console.log(`📋 Card: ${card.name} (ID: ${card.id}, User: ${card.userId})`);
      });
    } else {
      console.log("📭 No cards found for user");
    }
    
    return userCards;
  } catch (supabaseError) {
    console.error("💥 Error in getCardsSupabase:", supabaseError);
    return null;
  }
};
