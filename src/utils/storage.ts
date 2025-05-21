
import { BusinessCard, SupabaseBusinessCard } from "../types";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "business-cards";

// Function to map Supabase response to our BusinessCard format
const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
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

// We keep local storage functions as fallback
export const saveCardLocally = (card: BusinessCard): void => {
  const cards = getCardsLocally();
  const existingCardIndex = cards.findIndex((c) => c.id === card.id);
  
  if (existingCardIndex >= 0) {
    cards[existingCardIndex] = card;
  } else {
    cards.push(card);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const getCardsLocally = (): BusinessCard[] => {
  const storedCards = localStorage.getItem(STORAGE_KEY);
  return storedCards ? JSON.parse(storedCards) : [];
};

export const getCardByIdLocally = (id: string): BusinessCard | undefined => {
  const cards = getCardsLocally();
  return cards.find((card) => card.id === id);
};

export const deleteCardLocally = (id: string): void => {
  const cards = getCardsLocally();
  const filteredCards = cards.filter((card) => card.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCards));
};

// Functions that use Supabase
export const saveCard = async (card: BusinessCard): Promise<BusinessCard> => {
  try {
    // Save locally as backup
    saveCardLocally(card);
    
    console.log("Saving card to Supabase:", card);
    
    // Prepare data for Supabase
    const supabaseCard = {
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
    
    // Upsert to Supabase (insert or update)
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("Error saving to Supabase:", error);
      toast.error("No se pudo guardar la tarjeta en Supabase");
      throw error;
    }
    
    console.log("Card saved to Supabase successfully:", data);
    toast.success("Tarjeta guardada correctamente en Supabase");
    return card;
  } catch (error) {
    console.error("Error saving card to Supabase:", error);
    toast.error("Error al guardar la tarjeta");
    return card; // Return original card in case of error
  }
};

export const getCards = async (): Promise<BusinessCard[]> => {
  try {
    console.log("Fetching all cards from Supabase");
    const { data, error } = await supabase
      .from('cards')
      .select('*');
    
    if (error) {
      console.error("Supabase error fetching cards:", error);
      toast.error("Error al obtener las tarjetas de Supabase");
      throw error;
    }
    if (!data || data.length === 0) {
      console.log("No data found in Supabase, falling back to local storage");
      const localCards = getCardsLocally();
      if (localCards.length > 0) {
        toast.info("Mostrando tarjetas guardadas localmente");
      }
      return localCards; // Fallback to local storage
    }
    
    console.log("Cards fetched from Supabase:", data);
    toast.success("Tarjetas cargadas desde Supabase");
    return data.map((item: any) => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
  } catch (error) {
    console.error("Error getting cards from Supabase:", error);
    const localCards = getCardsLocally();
    toast.error("Error al conectar con Supabase, usando datos locales");
    return localCards; // Fallback to local storage
  }
};

export const getCardById = async (id: string): Promise<BusinessCard | undefined> => {
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
      throw error;
    }
    
    if (!data) {
      // If not found in Supabase, check locally
      console.log(`Card with ID ${id} not found in Supabase, checking locally`);
      const localCard = getCardByIdLocally(id);
      console.log("Local card result:", localCard);
      if (localCard) {
        toast.info("Mostrando tarjeta guardada localmente");
      }
      return localCard;
    }
    
    console.log("Card found in Supabase:", data);
    toast.success("Tarjeta cargada desde Supabase");
    return mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
  } catch (error) {
    console.error(`Error getting card ${id} from Supabase:`, error);
    console.log("Falling back to local storage");
    const localCard = getCardByIdLocally(id);
    toast.error("Error al conectar con Supabase, usando datos locales");
    return localCard; // Fallback to local storage
  }
};

export const deleteCard = async (id: string): Promise<void> => {
  try {
    // Delete locally as backup
    deleteCardLocally(id);
    
    console.log(`Deleting card with ID ${id} from Supabase`);
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting from Supabase:", error);
      toast.error("Error al eliminar la tarjeta de Supabase");
      throw error;
    }
    
    console.log("Card deleted successfully from Supabase");
    toast.success("Tarjeta eliminada correctamente");
  } catch (error) {
    console.error("Error deleting card from Supabase:", error);
    toast.error("Error al eliminar la tarjeta");
  }
};
