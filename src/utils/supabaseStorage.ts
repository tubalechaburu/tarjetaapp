
import { BusinessCard, SupabaseBusinessCard } from "../types";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

// Function to map Supabase response to our BusinessCard format
export const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  console.log("Mapping Supabase card:", card);
  return {
    id: card.id,
    name: card.name,
    jobTitle: card.title || "",
    company: card.company || "", 
    email: card.email || "",
    phone: card.phone || "",
    website: card.links && Array.isArray(card.links) && card.links.length > 0 
      ? card.links[0].url 
      : undefined,
    avatarUrl: card.photo,
    createdAt: new Date(card.created_at).getTime(),
    userId: card.user_id
  };
};

// Function to prepare card data for Supabase format
export const prepareSupabaseCard = (card: BusinessCard) => {
  return {
    id: card.id,
    name: card.name,
    title: card.jobTitle,
    company: card.company,
    email: card.email,
    phone: card.phone,
    photo: card.avatarUrl || null,
    links: card.website ? [{ type: "website", url: card.website }] : [],
    user_id: card.userId || "00000000-0000-0000-0000-000000000000", // Use default user ID if not provided
    theme: {
      text: "#FFFFFF",
      accent: "#9061F9",
      background: "#121212"
    }
  };
};

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
      console.error("Error saving to Supabase:", error);
      toast.error("No se pudo guardar la tarjeta en Supabase");
      return false;
    } else {
      console.log("Card saved to Supabase successfully:", data);
      toast.success("Tarjeta guardada correctamente en Supabase");
      return true;
    }
  } catch (supabaseError) {
    console.error("Supabase operation failed:", supabaseError);
    toast.warning("Error al guardar en Supabase");
    return false;
  }
};

export const getCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("Fetching all cards from Supabase");
    
    const { data, error } = await supabase
      .from('cards')
      .select('*');
    
    if (error) {
      console.error("Supabase error fetching cards:", error);
      toast.error("Error al obtener las tarjetas de Supabase");
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log("No data found in Supabase");
      return [];
    }
    
    console.log("Cards fetched from Supabase:", data);
    toast.success("Tarjetas cargadas desde Supabase");
    return data.map((item: any) => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
  } catch (supabaseError) {
    console.error("Supabase operation failed:", supabaseError);
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
      console.error("Supabase error fetching card:", error);
      toast.error("Error al obtener la tarjeta de Supabase");
      return null;
    }
    
    if (!data) {
      console.log(`Card with ID ${id} not found in Supabase`);
      return null;
    }
    
    console.log("Card found in Supabase:", data);
    toast.success("Tarjeta cargada desde Supabase");
    return mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
  } catch (supabaseError) {
    console.error("Supabase operation failed:", supabaseError);
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
      console.error("Error deleting from Supabase:", error);
      toast.error("Error al eliminar la tarjeta de Supabase");
      return false;
    }
    
    console.log("Card deleted successfully from Supabase");
    toast.success("Tarjeta eliminada correctamente");
    return true;
  } catch (supabaseError) {
    console.error("Supabase operation failed:", supabaseError);
    return false;
  }
};
