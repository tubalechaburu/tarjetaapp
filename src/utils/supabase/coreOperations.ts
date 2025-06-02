
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./mappers";
import { handleSupabaseError, isEmptyData } from "./helpers";

export const saveCardToSupabase = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Saving card to Supabase:", card.name);
    
    // Verificar autenticación antes de guardar
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      return false;
    }

    // RLS policies will automatically handle authorization
    // No need for manual user_id checks - the database will enforce this
    
    // Prepare data for Supabase
    const supabaseCard = prepareSupabaseCard({
      ...card,
      userId: user.id // Ensure correct user ID
    });
    
    // Try to upsert to Supabase
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

export const getUserCardsFromSupabase = async (userId: string): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Loading user cards from Supabase...", userId);
    
    // RLS policies will automatically filter to only user's own cards
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId);
    
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
    console.error("💥 Error in getUserCardsFromSupabase:", supabaseError);
    return null;
  }
};

export const getCardByIdFromSupabase = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Loading card ${id} from Supabase...`);
    
    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email);

    // RLS policies will automatically handle access control
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
      console.log(`📭 Card ${id} not found or not accessible`);
      return null;
    }
    
    console.log("✅ Card found:", data.name);
    const mappedCard = mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
    return mappedCard;
  } catch (supabaseError) {
    console.error("💥 Error in getCardByIdFromSupabase:", supabaseError);
    return null;
  }
};

export const deleteCardFromSupabase = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting card with ID ${id} from Supabase`);
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      return false;
    }

    // RLS policies will automatically handle authorization
    // Users can only delete their own cards, superadmins can delete any card
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
