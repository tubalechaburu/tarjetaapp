
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./mappers";
import { handleSupabaseError, isEmptyData } from "./helpers";
import { sanitizeErrorMessage, validateInput } from "./securityHelpers";

export const saveCardToSupabase = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Saving card to Supabase:", card.name);
    
    // Enhanced input validation
    if (!validateInput(card.name, 100)) {
      console.error("❌ Invalid card name");
      return false;
    }
    
    if (card.email && !validateInput(card.email, 254)) {
      console.error("❌ Invalid email format");
      return false;
    }
    
    // Secure authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      return false;
    }

    // RLS policies will automatically handle authorization and rate limiting
    const supabaseCard = prepareSupabaseCard({
      ...card,
      userId: user.id // Ensure correct user ID
    });
    
    console.log("📤 Upserting card to Supabase with data:", {
      id: supabaseCard.id,
      name: supabaseCard.name,
      user_id: supabaseCard.user_id
    });
    
    // Secure upsert with RLS protection
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) {
      console.error("❌ Supabase error:", sanitizeErrorMessage(error));
      return handleSupabaseError(error, sanitizeErrorMessage("Card could not be saved"));
    } else {
      console.log("✅ Card saved successfully to Supabase:", data);
      return true;
    }
  } catch (supabaseError) {
    console.error("💥 Save card error:", sanitizeErrorMessage(supabaseError));
    return handleSupabaseError(supabaseError, sanitizeErrorMessage("Error saving card"));
  }
};

export const getUserCardsFromSupabase = async (userId: string): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Loading user cards from Supabase...", userId);
    
    // RLS policies will automatically filter to only accessible cards
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("❌ Database query error:", sanitizeErrorMessage(error));
      return null;
    }
    
    console.log("✅ User cards data:", data?.length || 0);
    
    if (isEmptyData(data)) {
      console.log("📭 No cards found for user");
      return [];
    }
    
    const mappedCards = (data as SupabaseBusinessCard[]).map(item => mapSupabaseToBusinessCard(item));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getUserCardsFromSupabase:", sanitizeErrorMessage(supabaseError));
    return null;
  }
};

export const getCardByIdFromSupabase = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Loading card ${id} from Supabase...`);
    
    // Con las nuevas políticas RLS, cualquiera puede ver las tarjetas
    // No necesitamos verificar autenticación para lectura
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("❌ Database query error:", sanitizeErrorMessage(error));
      return null;
    }
    
    if (!data) {
      console.log(`📭 Card ${id} not found in Supabase`);
      return null;
    }
    
    console.log("✅ Card found in Supabase:", data.name);
    const mappedCard = mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
    return mappedCard;
  } catch (supabaseError) {
    console.error("💥 Error in getCardByIdFromSupabase:", sanitizeErrorMessage(supabaseError));
    return null;
  }
};

export const deleteCardFromSupabase = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting card with ID ${id} from Supabase`);
    
    // Secure authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      return false;
    }

    // RLS policies will automatically handle authorization
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleSupabaseError(error, sanitizeErrorMessage("Error deleting card"));
    }
    
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, sanitizeErrorMessage("Error connecting to database"));
  }
};
