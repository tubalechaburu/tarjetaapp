
import { BusinessCard, SupabaseBusinessCard } from "../types";
import { supabase } from "../integrations/supabase/client";

const STORAGE_KEY = "business-cards";

// Función para mapear la respuesta de Supabase a nuestro formato BusinessCard
const mapSupabaseToBusinessCard = (card: SupabaseBusinessCard): BusinessCard => {
  return {
    id: card.id,
    name: card.name,
    jobTitle: card.title || "",
    company: "", // La tabla de Supabase no tiene este campo, pero podríamos actualizarla
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
    
    // Preparamos los datos para Supabase
    const supabaseCard = {
      id: card.id,
      name: card.name,
      title: card.jobTitle,
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
    
    if (error) throw error;
    
    return card;
  } catch (error) {
    console.error("Error al guardar la tarjeta en Supabase:", error);
    return card; // Devolvemos la tarjeta original en caso de error
  }
};

export const getCards = async (): Promise<BusinessCard[]> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*');
    
    if (error) throw error;
    if (!data) return getCardsLocally(); // Fallback a almacenamiento local
    
    return data.map((item: any) => mapSupabaseToBusinessCard(item as SupabaseBusinessCard));
  } catch (error) {
    console.error("Error al obtener tarjetas de Supabase:", error);
    return getCardsLocally(); // Fallback a almacenamiento local
  }
};

export const getCardById = async (id: string): Promise<BusinessCard | undefined> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) {
      // Si no encontramos en Supabase, buscamos localmente
      console.log("Tarjeta no encontrada en Supabase, buscando localmente");
      return getCardByIdLocally(id);
    }
    
    return mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
  } catch (error) {
    console.error("Error al obtener la tarjeta de Supabase:", error);
    return getCardByIdLocally(id); // Fallback a almacenamiento local
  }
};

export const deleteCard = async (id: string): Promise<void> => {
  try {
    // Eliminamos localmente como respaldo
    deleteCardLocally(id);
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error al eliminar la tarjeta de Supabase:", error);
  }
};
