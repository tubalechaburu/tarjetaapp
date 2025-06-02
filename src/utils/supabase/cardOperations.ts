
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./mappers";
import { handleSupabaseError, isEmptyData } from "./helpers";
import { verifyAuthentication, checkSuperAdminStatus } from "./auth";
import { checkCardOwnership, checkDeletePermissions } from "./permissions";

export const saveCardSupabase = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Saving card to Supabase:", card.name);
    
    const user = await verifyAuthentication();
    if (!user) return false;

    const hasPermission = await checkCardOwnership(card, user.id);
    if (!hasPermission) return false;

    const supabaseCard = prepareSupabaseCard({
      ...card,
      userId: user.id
    });
    
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("❌ Supabase error:", error);
      return handleSupabaseError(error, "No se pudo guardar la tarjeta");
    } else {
      console.log("✅ Card saved successfully:", data);
      return true;
    }
  } catch (supabaseError) {
    console.error("💥 Save card error:", supabaseError);
    return handleSupabaseError(supabaseError, "Error al guardar la tarjeta");
  }
};

export const deleteCardSupabase = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting card with ID ${id} from Supabase`);
    
    const user = await verifyAuthentication();
    if (!user) return false;

    const hasPermission = await checkDeletePermissions(id, user.id);
    if (!hasPermission) return false;
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleSupabaseError(error, "Error al eliminar la tarjeta");
    }
    
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error al conectar con la base de datos");
  }
};

export const getCardByIdSupabase = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Loading card ${id} from Supabase...`);
    
    const user = await verifyAuthentication();
    if (!user) return null;

    console.log("👤 User authenticated:", user.email);

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("❌ Database query error:", error);
      return null;
    }
    
    if (!data) {
      console.log(`📭 Card ${id} not found`);
      return null;
    }
    
    console.log("✅ Card found:", data.name);
    const mappedCard = mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
    return mappedCard;
  } catch (supabaseError) {
    console.error("💥 Error in getCardByIdSupabase:", supabaseError);
    return null;
  }
};
