
import { BusinessCard, SupabaseBusinessCard } from "../types";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./supabase/mappers";
import { handleSupabaseError, handleSupabaseSuccess, isEmptyData } from "./supabase/helpers";

export const saveCardSupabase = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("Saving card to Supabase:", card);
    
    // Prepare data for Supabase
    const supabaseCard = prepareSupabaseCard(card);
    
    // Try to upsert to Supabase
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("Supabase error:", error);
      return handleSupabaseError(error, "No se pudo guardar la tarjeta");
    } else {
      handleSupabaseSuccess(data, "Tarjeta guardada correctamente");
      return true;
    }
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error al guardar la tarjeta");
  }
};

export const getCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Starting getCardsSupabase...");
    
    // Get current user first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("👤 Current user:", user?.id, user?.email);
    
    if (userError) {
      console.error("❌ Error getting user:", userError);
      toast.error("Error de autenticación");
      return null;
    }
    
    if (!user) {
      console.log("❌ No user authenticated");
      toast.error("Usuario no autenticado");
      return null;
    }
    
    // Use the database function to get user cards
    console.log("📋 Loading user cards using database function...");
    const { data, error } = await supabase.rpc('get_user_cards', {
      user_uuid: user.id
    });
    
    if (error) {
      console.error("❌ Database function error:", error);
      toast.error("Error al obtener las tarjetas");
      return null;
    }
    
    console.log("✅ Raw cards data from function:", data);
    console.log("📊 Number of cards found:", data?.length || 0);
    
    if (isEmptyData(data)) {
      console.log("📭 No cards found in Supabase");
      return [];
    }
    
    // Map the data
    console.log("🔄 Mapping cards...");
    const mappedCards = (data as SupabaseBusinessCard[]).map(item => {
      console.log("🔄 Mapping card:", item.id, item.name);
      return mapSupabaseToBusinessCard(item);
    });
    
    console.log("✅ Final mapped cards:", mappedCards.length, "cards");
    toast.success(`${mappedCards.length} tarjetas cargadas correctamente`);
    
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getCardsSupabase:", supabaseError);
    toast.error("Error al conectar con la base de datos");
    return null;
  }
};

export const getCardByIdSupabase = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`Fetching card with ID ${id} from Supabase`);
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Supabase query error:", error);
      handleSupabaseError(error, "Error al obtener la tarjeta");
      return null;
    }
    
    if (!data) {
      console.log(`Card with ID ${id} not found in Supabase`);
      return null;
    }
    
    console.log(`Card with ID ${id} found in Supabase:`, data);
    handleSupabaseSuccess(data, "Tarjeta cargada correctamente");
    
    const card = mapSupabaseToBusinessCard(data as unknown as SupabaseBusinessCard);
    return card;
  } catch (supabaseError) {
    handleSupabaseError(supabaseError, "Error al conectar con la base de datos");
    return null;
  }
};

export const deleteCardSupabase = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting card with ID ${id} from Supabase`);
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleSupabaseError(error, "Error al eliminar la tarjeta");
    }
    
    handleSupabaseSuccess(null, "Tarjeta eliminada correctamente");
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error al conectar con la base de datos");
  }
};
