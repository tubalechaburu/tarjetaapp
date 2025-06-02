
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
    
    // Secure upsert with RLS protection
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("❌ Supabase error:", sanitizeErrorMessage(error));
      return handleSupabaseError(error, sanitizeErrorMessage("Card could not be saved"));
    } else {
      console.log("✅ Card saved successfully:", data);
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
    
    // Secure authentication check
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", sanitizeErrorMessage(userError));
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email);

    // RLS policies will automatically handle access control
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
      console.log(`📭 Card ${id} not found or not accessible`);
      return null;
    }
    
    console.log("✅ Card found:", data.name);
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
