
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
    // Save locally first
    saveCardLocally(card);
    console.log("Card saved locally:", card.id);
    
    // Then try to save to Supabase
    try {
      console.log("Attempting to save card to Supabase:", card.id);
      const saved = await saveCardSupabase(card);
      
      if (saved) {
        console.log("Card successfully saved to Supabase");
        toast.success("Tarjeta guardada en la nube");
      } else {
        console.log("Failed to save to Supabase, using local storage only");
        toast.warning("Tarjeta guardada localmente solamente");
      }
    } catch (supabaseError) {
      console.error("Supabase operation failed:", supabaseError);
      toast.warning("Tarjeta guardada localmente solamente");
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
    console.log(`Looking for card with ID ${id} in storage systems`);
    
    // Try to fetch from Supabase first
    try {
      console.log(`Querying Supabase for card ID: ${id}`);
      const supabaseCard = await getCardByIdSupabase(id);
      
      if (supabaseCard) {
        console.log(`Found card with ID ${id} in Supabase`);
        return supabaseCard;
      }
      
      console.log(`Card with ID ${id} not found in Supabase, checking locally`);
      // If not found in Supabase, check locally
      const localCard = getCardByIdLocally(id);
      console.log("Local card result:", localCard);
      
      if (localCard) {
        // If found locally but not in Supabase, try to sync it to Supabase for future use
        console.log("Found locally, attempting to sync to Supabase for sharing");
        try {
          await saveCardSupabase(localCard);
          console.log("Successfully synced local card to Supabase");
          toast.success("Tarjeta sincronizada a la nube");
        } catch (syncError) {
          console.error("Failed to sync local card to Supabase:", syncError);
          toast.error("No se pudo sincronizar la tarjeta a la nube");
        }
        return localCard;
      }
      
      console.log(`Card with ID ${id} not found in any storage`);
      return undefined;
    } catch (supabaseError) {
      console.error("Supabase operation failed:", supabaseError);
      const localCard = getCardByIdLocally(id);
      return localCard;
    }
  } catch (error) {
    console.error(`Error getting card ${id}:`, error);
    const localCard = getCardByIdLocally(id);
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
