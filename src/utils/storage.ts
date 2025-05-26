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

// IMPROVED: Normalize card data to ensure consistent visibility fields
const normalizeCardData = (card: BusinessCard): BusinessCard => {
  // Ensure visibleFields exists and has proper boolean values
  const defaultVisibleFields = {
    name: true,
    jobTitle: true,
    company: true,
    email: true,
    phone: true,
    website: true,
    address: true,
    description: true,
    avatarUrl: true,
    logoUrl: true,
  };
  
  // If no visibleFields, use defaults
  if (!card.visibleFields) {
    console.log("Normalizing card - no visibleFields, using defaults");
    return {
      ...card,
      visibleFields: defaultVisibleFields
    };
  }
  
  // Normalize existing visibleFields to ensure proper boolean values
  const normalizedVisibleFields = {};
  Object.keys(defaultVisibleFields).forEach(key => {
    // Only set to true if explicitly true, otherwise false
    normalizedVisibleFields[key] = card.visibleFields[key] === true;
  });
  
  console.log("Normalizing card visibility fields:", {
    original: card.visibleFields,
    normalized: normalizedVisibleFields
  });
  
  return {
    ...card,
    visibleFields: normalizedVisibleFields
  };
};

// Main storage API that handles both Supabase and local storage
export const saveCard = async (card: BusinessCard): Promise<BusinessCard> => {
  try {
    // Normalize card data before saving
    const normalizedCard = normalizeCardData(card);
    console.log("Saving normalized card:", normalizedCard.name, normalizedCard.visibleFields);
    
    // Save locally first
    saveCardLocally(normalizedCard);
    console.log("Card saved locally:", normalizedCard.id);
    
    // Then try to save to Supabase
    try {
      console.log("Attempting to save card to Supabase:", normalizedCard.id);
      const saved = await saveCardSupabase(normalizedCard);
      
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
    
    return normalizedCard;
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
        // Normalize local cards
        const normalizedCards = localCards.map(normalizeCardData);
        if (normalizedCards.length > 0) {
          toast.info("Mostrando tarjetas guardadas localmente");
        }
        return normalizedCards;
      }
      
      if (supabaseCards.length === 0) {
        // If no cards in Supabase, check local storage
        console.log("No cards in Supabase, checking local storage");
        const localCards = getCardsLocally();
        const normalizedCards = localCards.map(normalizeCardData);
        if (normalizedCards.length > 0) {
          toast.info("Mostrando tarjetas guardadas localmente");
          return normalizedCards;
        }
      }
      
      // Normalize Supabase cards
      return supabaseCards.map(normalizeCardData);
    } catch (supabaseError) {
      // If Supabase operation failed, fall back to local storage
      console.error("Supabase operation failed:", supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error("Error getting cards from Supabase:", error);
    const localCards = getCardsLocally();
    const normalizedCards = localCards.map(normalizeCardData);
    toast.error("Error al conectar con Supabase, usando datos locales");
    return normalizedCards; // Fallback to local storage
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
        return normalizeCardData(supabaseCard);
      }
      
      console.log(`Card with ID ${id} not found in Supabase, checking locally`);
      // If not found in Supabase, check locally
      const localCard = getCardByIdLocally(id);
      console.log("Local card result:", localCard);
      
      if (localCard) {
        const normalizedCard = normalizeCardData(localCard);
        // If found locally but not in Supabase, try to sync it to Supabase for future use
        console.log("Found locally, attempting to sync to Supabase for sharing");
        try {
          await saveCardSupabase(normalizedCard);
          console.log("Successfully synced local card to Supabase");
          toast.success("Tarjeta sincronizada a la nube");
        } catch (syncError) {
          console.error("Failed to sync local card to Supabase:", syncError);
          toast.error("No se pudo sincronizar la tarjeta a la nube");
        }
        return normalizedCard;
      }
      
      console.log(`Card with ID ${id} not found in any storage`);
      return undefined;
    } catch (supabaseError) {
      console.error("Supabase operation failed:", supabaseError);
      const localCard = getCardByIdLocally(id);
      return localCard ? normalizeCardData(localCard) : undefined;
    }
  } catch (error) {
    console.error(`Error getting card ${id}:`, error);
    const localCard = getCardByIdLocally(id);
    return localCard ? normalizeCardData(localCard) : undefined; // Fallback to local storage
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
