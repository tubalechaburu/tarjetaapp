
import { BusinessCard, SupabaseBusinessCard } from "../types";
import { supabase } from "../integrations/supabase/client";

const STORAGE_KEY = "business-cards";

// Función para mapear la respuesta de Supabase a nuestro formato BusinessCard
const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  console.log("Mapping Supabase card:", card);
  return {
    id: card.id,
    name: card.name,
    jobTitle: card.title || "",
    company: card.company || "", // Ahora manejamos este campo
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

// Conservamos las funciones locales como respaldo
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

// Nuevas funciones que utilizan Supabase
export const saveCard = async (card: BusinessCard): Promise<BusinessCard> => {
  try {
    // Guardamos localmente como respaldo
    saveCardLocally(card);
    
    console.log("Saving card to Supabase:", card);
    
    // Preparamos los datos para Supabase
    const supabaseCard = {
      id: card.id,
      name: card.name,
      title: card.jobTitle,
      company: card.company, // Aseguramos que este campo se guarde
      email: card.email,
      phone: card.phone,
      photo: card.avatarUrl || null,
      links: card.website ? [{ type: "website", url: card.website }] : [],
      user_id: card.userId || "anonymous",
      theme: {
        text: "#FFFFFF",
        accent: "#9061F9",
        background: "#121212"
      }
    };
    
    // Upsert en Supabase (insertar o actualizar)
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("Error al guardar en Supabase:", error);
      throw error;
    }
    
    console.log("Card saved to Supabase successfully:", data);
    return card;
  } catch (error) {
    console.error("Error al guardar la tarjeta en Supabase:", error);
    return card; // Devolvemos la tarjeta original en caso de error
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
      throw error;
    }
    if (!data) {
      console.log("No data found in Supabase, falling back to local storage");
      return getCardsLocally(); // Fallback a almacenamiento local
    }
    
    console.log("Cards fetched from Supabase:", data);
    return data.map((item: any) => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
  } catch (error) {
    console.error("Error al obtener tarjetas de Supabase:", error);
    return getCardsLocally(); // Fallback a almacenamiento local
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
      throw error;
    }
    
    if (!data) {
      // Si no encontramos en Supabase, buscamos localmente
      console.log(`Card with ID ${id} not found in Supabase, checking locally`);
      const localCard = getCardByIdLocally(id);
      console.log("Local card result:", localCard);
      return localCard;
    }
    
    console.log("Card found in Supabase:", data);
    return mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
  } catch (error) {
    console.error(`Error al obtener la tarjeta ${id} de Supabase:`, error);
    console.log("Falling back to local storage");
    return getCardByIdLocally(id); // Fallback a almacenamiento local
  }
};

export const deleteCard = async (id: string): Promise<void> => {
  try {
    // Eliminamos localmente como respaldo
    deleteCardLocally(id);
    
    console.log(`Deleting card with ID ${id} from Supabase`);
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting from Supabase:", error);
      throw error;
    }
    
    console.log("Card deleted successfully from Supabase");
  } catch (error) {
    console.error("Error al eliminar la tarjeta de Supabase:", error);
  }
};
