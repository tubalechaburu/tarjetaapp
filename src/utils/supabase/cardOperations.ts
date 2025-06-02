
import { BusinessCard } from "../../types";
import { toast } from "sonner";
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

    console.log("👤 User authenticated:", userData.user.email);

    // Check if user is superadmin
    const isSuperAdmin = await checkSuperAdminAccess();
    console.log("🎭 Is superadmin:", isSuperAdmin);

    // If superadmin, get all cards
    if (isSuperAdmin) {
      console.log("🔐 Superadmin detected, fetching all cards...");
      return await getAllCardsForAdmin();
    }
    
    // For regular users, get only their cards
    console.log("👤 Regular user, fetching own cards...");
    return await getUserCardsFromSupabase(userData.user.id);
  } catch (supabaseError) {
    console.error("💥 Error in getCardsSupabase:", supabaseError);
    return null;
  }
};
