
// Main entry point for Supabase storage operations
// Re-exports functions from specialized modules

export { saveCardSupabase, deleteCardSupabase, getCardByIdSupabase } from "./supabase/cardOperations";
export { getCardsSupabase, getAllCardsSupabase } from "./supabase/cardQueries";
export { verifyAuthentication, checkSuperAdminStatus } from "./supabase/auth";
export { checkCardOwnership, checkDeletePermissions } from "./supabase/permissions";
