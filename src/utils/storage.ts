
import { BusinessCard } from "../types";
import { toast } from "sonner";
import { checkSupabaseConnection } from "../integrations/supabase/client";

// Import local storage operations
import { 
  saveCardLocally, 
  getCardsLocally, 
  getCardByIdLocally, 
  deleteCardLocally 
} from "./localStorage";

// Import Supabase storage operations
import { 
  saveCardSupabase, 
  getCardsSupabase, 
  getCardByIdSupabase, 
  deleteCardSupabase 
} from "./supabaseStorage";

// Re-export local storage functions as they might be used directly
export { 
  saveCardLocally, 
  getCardsLocally, 
  getCardByIdLocally, 
  deleteCardLocally 
};

// Main storage API that handles both Supabase and local storage
export const saveCard = async (card: BusinessCard): Promise<BusinessCard> => {
  try {
    // Save locally as backup
    saveCardLocally(card);
    
    // Try to save to Supabase, fallback to local if it fails
    try {
      const saved = await saveCardSupabase(card);
      if (!saved) {
        toast.warning("Usando almacenamiento local como respaldo");
      }
    } catch (supabaseError) {
      console.error("Supabase operation failed:", supabaseError);
      toast.warning("Usando almacenamiento local como respaldo");
    }
    
    return card;
  } catch (error) {
    console.error("Error saving card:", error);
    toast.error("Error al guardar la tarjeta");
    return card; // Return original card in case of error
  }
};

export const getCards = async (): Promise<BusinessCard[]> => {
  try {
    // Try to fetch from Supabase first
    try {
      const supabaseCards = await getCardsSupabase();
      
      if (supabaseCards === null) {
        // If Supabase query failed, fall back to local storage
        console.log("Supabase query failed, falling back to local storage");
        const localCards = getCardsLocally();
        if (localCards.length > 0) {
          toast.info("Mostrando tarjetas guardadas localmente");
        }
        return localCards;
      }
      
      if (supabaseCards.length === 0) {
        // If no cards in Supabase, check local storage
        console.log("No cards in Supabase, checking local storage");
        const localCards = getCardsLocally();
        if (localCards.length > 0) {
          toast.info("Mostrando tarjetas guardadas localmente");
          return localCards;
        }
      }
      
      return supabaseCards;
    } catch (supabaseError) {
      // If Supabase operation failed, fall back to local storage
      console.error("Supabase operation failed:", supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error("Error getting cards from Supabase:", error);
    const localCards = getCardsLocally();
    toast.error("Error al conectar con Supabase, usando datos locales");
    return localCards; // Fallback to local storage
  }
};

export const getCardById = async (id: string): Promise<BusinessCard | undefined> => {
  try {
    // Try to fetch from Supabase first
    try {
      const supabaseCard = await getCardByIdSupabase(id);
      
      if (supabaseCard === null) {
        // If not found in Supabase or query failed, check locally
        console.log(`Card with ID ${id} not found in Supabase or query failed, checking locally`);
        const localCard = getCardByIdLocally(id);
        console.log("Local card result:", localCard);
        if (localCard) {
          toast.info("Mostrando tarjeta guardada localmente");
        }
        return localCard;
      }
      
      return supabaseCard;
    } catch (supabaseError) {
      console.error("Supabase operation failed:", supabaseError);
      throw supabaseError;
    }
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
    
    // Try to delete from Supabase
    try {
      await deleteCardSupabase(id);
    } catch (supabaseError) {
      console.error("Supabase operation failed:", supabaseError);
      toast.warning("Tarjeta eliminada localmente");
    }
  } catch (error) {
    console.error("Error deleting card from Supabase:", error);
    toast.error("Error al eliminar la tarjeta");
  }
};
