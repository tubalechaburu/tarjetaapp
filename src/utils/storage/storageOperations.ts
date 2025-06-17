
import { BusinessCard } from "../../types";
import { saveCardSupabase, getCardsSupabase, getCardByIdSupabase, deleteCardSupabase } from "../supabase/cardOperations";
import { getCardsLocally, saveCardLocally, deleteCardLocally } from "../localStorage";

export const getCardById = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Fetching card with ID: ${id}`);
    
    // PRIMERA PRIORIDAD: Intentar obtener de Supabase (ahora es público)
    console.log("🌐 Trying Supabase first (public access)...");
    const supabaseCard = await getCardByIdSupabase(id);
    
    if (supabaseCard) {
      console.log("✅ Card found in Supabase:", supabaseCard.name);
      return supabaseCard;
    }
    
    // SEGUNDA PRIORIDAD: Buscar en localStorage como fallback
    console.log("💾 Falling back to localStorage...");
    const localCards = getCardsLocally();
    const localCard = localCards.find(card => card.id === id);
    
    if (localCard) {
      console.log("✅ Card found in localStorage:", localCard.name);
      console.log("🔄 Attempting to sync to Supabase...");
      
      // Intentar sincronizar a Supabase para futuros accesos
      try {
        await saveCardSupabase(localCard);
        console.log("✅ Card synced to Supabase successfully");
      } catch (syncError) {
        console.error("⚠️ Could not sync to Supabase:", syncError);
        // No es crítico, devolvemos la tarjeta local
      }
      
      return localCard;
    }
    
    console.log(`❌ Card ${id} not found in any storage`);
    return null;
  } catch (error) {
    console.error("💥 Error in getCardById:", error);
    return null;
  }
};

// Nueva función específica para obtener tarjetas para compartir
export const getCardForSharing = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Fetching card for sharing with ID: ${id}`);
    
    // Para compartir, SOLO usar Supabase
    console.log("🌐 Getting card from Supabase for sharing...");
    const supabaseCard = await getCardByIdSupabase(id);
    
    if (supabaseCard) {
      console.log("✅ Card found in Supabase for sharing:", supabaseCard.name);
      return supabaseCard;
    }
    
    console.log(`❌ Card ${id} not found in Supabase for sharing`);
    return null;
  } catch (error) {
    console.error("💥 Error getting card for sharing:", error);
    return null;
  }
};

// Nueva función para asegurar que una tarjeta esté sincronizada en Supabase antes de compartir
export const ensureCardInSupabase = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("🔄 Ensuring card is in Supabase before sharing:", card.name);
    
    // Verificar si ya existe en Supabase
    if (card.id) {
      const existingCard = await getCardByIdSupabase(card.id);
      if (existingCard) {
        console.log("✅ Card already exists in Supabase");
        return true;
      }
    }
    
    // Si no existe, intentar guardarla
    console.log("📤 Saving card to Supabase for sharing...");
    const saved = await saveCardSupabase(card);
    
    if (saved) {
      console.log("✅ Card successfully saved to Supabase for sharing");
      return true;
    } else {
      console.error("❌ Failed to save card to Supabase");
      return false;
    }
  } catch (error) {
    console.error("💥 Error ensuring card is in Supabase:", error);
    return false;
  }
};

export const saveCard = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Saving card:", card.name);
    
    // Siempre intentar guardar en Supabase primero para nuevas tarjetas
    const supabaseSuccess = await saveCardSupabase(card);
    
    if (supabaseSuccess) {
      console.log("✅ Card saved to Supabase successfully");
      // También guardar localmente como backup
      saveCardLocally(card);
      return true;
    } else {
      console.log("⚠️ Supabase save failed, saving to localStorage as fallback");
      // Si falla Supabase, guardar localmente
      saveCardLocally(card);
      return true; // Devolver true porque al menos se guardó localmente
    }
  } catch (error) {
    console.error("💥 Error saving card:", error);
    // Como último recurso, intentar localStorage
    try {
      saveCardLocally(card);
      return true;
    } catch (localError) {
      console.error("💥 Failed to save to localStorage too:", localError);
      return false;
    }
  }
};

export const getCards = async (): Promise<BusinessCard[]> => {
  try {
    console.log("🔍 Fetching cards...");
    
    // Intentar obtener de Supabase primero
    const supabaseCards = await getCardsSupabase();
    
    if (supabaseCards) {
      console.log(`✅ Found ${supabaseCards.length} cards in Supabase`);
      return supabaseCards;
    }
    
    // Fallback a localStorage
    console.log("💾 Falling back to localStorage");
    const localCards = getCardsLocally();
    console.log(`✅ Found ${localCards.length} cards in localStorage`);
    
    return localCards;
  } catch (error) {
    console.error("💥 Error fetching cards:", error);
    // Último recurso: localStorage
    return getCardsLocally();
  }
};

export const deleteCard = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting card: ${id}`);
    
    // Intentar eliminar de Supabase
    const supabaseSuccess = await deleteCardSupabase(id);
    
    // Siempre intentar eliminar de localStorage también
    const localSuccess = deleteCardLocally(id);
    
    // Éxito si al menos uno funcionó
    const success = supabaseSuccess || localSuccess;
    
    if (success) {
      console.log("✅ Card deleted successfully");
    } else {
      console.log("❌ Failed to delete card from both storages");
    }
    
    return success;
  } catch (error) {
    console.error("💥 Error deleting card:", error);
    return false;
  }
};
