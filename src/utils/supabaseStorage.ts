
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
  saveCardSupabase as save, 
  getCardsSupabase as getCards, 
  getCardByIdSupabase as getById, 
  deleteCardSupabase as deleteCard,
  getAllCardsSupabase as getAllCards 
} from "./supabase/cardOperations";

// Maintain legacy function names
export const saveCard = save;
export const getCards = getCards;
export const getCardById = getById;
export const deleteCard = deleteCard;
export const getAllCards = getAllCards;
