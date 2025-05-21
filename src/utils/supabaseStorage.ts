
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
      return handleSupabaseError(error, "No se pudo guardar la tarjeta en Supabase");
    } else {
      handleSupabaseSuccess(data, "Tarjeta guardada correctamente en Supabase");
      return true;
    }
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error al guardar en Supabase");
  }
};

export const getCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("Fetching all cards from Supabase");
    
    const { data, error } = await supabase
      .from('cards')
      .select('*');
    
    if (error) {
      handleSupabaseError(error, "Error al obtener las tarjetas de Supabase");
      return null;
    }
    
    if (isEmptyData(data)) {
      console.log("No data found in Supabase");
      return [];
    }
    
    handleSupabaseSuccess(data, "Tarjetas cargadas desde Supabase");
    // Explicitly cast the data as SupabaseBusinessCard[]
    return (data as SupabaseBusinessCard[]).map(item => mapSupabaseToBusinessCard(item));
  } catch (supabaseError) {
    handleSupabaseError(supabaseError, "Error al conectar con Supabase");
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
      handleSupabaseError(error, "Error al obtener la tarjeta de Supabase");
      return null;
    }
    
    if (!data) {
      console.log(`Card with ID ${id} not found in Supabase`);
      return null;
    }
    
    handleSupabaseSuccess(data, "Tarjeta cargada desde Supabase");
    // Explicitly cast the data as SupabaseBusinessCard
    return mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
  } catch (supabaseError) {
    handleSupabaseError(supabaseError, "Error al conectar con Supabase");
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
      return handleSupabaseError(error, "Error al eliminar la tarjeta de Supabase");
    }
    
    handleSupabaseSuccess(null, "Tarjeta eliminada correctamente");
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error al conectar con Supabase");
  }
};
