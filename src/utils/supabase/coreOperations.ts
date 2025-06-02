
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

    // Verificar que el usuario solo pueda editar sus propias tarjetas
    if (card.id && card.userId && card.userId !== user.id) {
      console.error("❌ User trying to edit card they don't own");
      return false;
    }

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

    // Obtener la tarjeta directamente - RLS manejará los permisos
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

    // Verificar que la tarjeta pertenece al usuario (excepto superadmin)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'superadmin') {
      const { data: card } = await supabase
        .from('cards')
        .select('user_id')
        .eq('id', id)
        .single();

      if (card && card.user_id !== user.id) {
        console.error("❌ User trying to delete card they don't own");
        return false;
      }
    }
    
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
