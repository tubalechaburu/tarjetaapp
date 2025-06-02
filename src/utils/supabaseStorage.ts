
// Re-export all operations from the new modular structure
export { 
  saveCardSupabase, 
  getCardsSupabase, 
  getCardByIdSupabase, 
  deleteCardSupabase,
  getAllCardsSupabase 
} from "./supabase/cardOperations";

// Re-export admin operations
export { checkSuperAdminAccess } from "./supabase/adminOperations";

// Legacy exports for backward compatibility - these will be removed in future versions
// Import and re-export to maintain existing functionality
import { 
  saveCardSupabase as saveCardSupabaseImpl, 
  getCardsSupabase as getCardsSupabaseImpl, 
  getCardByIdSupabase as getCardByIdSupabaseImpl, 
  deleteCardSupabase as deleteCardSupabaseImpl,
  getAllCardsSupabase as getAllCardsSupabaseImpl 
} from "./supabase/cardOperations";

// Maintain legacy function names
export const saveCard = saveCardSupabaseImpl;
export const getCards = getCardsSupabaseImpl;
export const getCardById = getCardByIdSupabaseImpl;
export const deleteCard = deleteCardSupabaseImpl;
export const getAllCards = getAllCardsSupabaseImpl;
