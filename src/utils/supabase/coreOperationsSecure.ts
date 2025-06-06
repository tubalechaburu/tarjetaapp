
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./mappers";
import { handleSupabaseError, isEmptyData } from "./helpers";
import { sanitizeErrorMessage, validateEmail, validatePhone, validateUrl, sanitizeInput } from "../security/validation";
import { authService } from "../security/authService";

// Helper function to validate basic input constraints
const validateBasicInput = (input: string, maxLength: number): boolean => {
  return input && typeof input === 'string' && input.trim().length > 0 && input.length <= maxLength;
};

export const saveCardToSupabaseSecure = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Securely saving card to Supabase:", card.name);
    
    // Enhanced authentication and session validation
    const isValidSession = await authService.validateSession();
    if (!isValidSession) {
      console.error("❌ Invalid or expired session");
      return false;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated:", sanitizeErrorMessage(authError));
      return false;
    }

    // Enhanced input validation with security checks
    if (!validateBasicInput(card.name, 100)) {
      console.error("❌ Invalid card name");
      return false;
    }
    
    if (card.email && !validateEmail(card.email)) {
      console.error("❌ Invalid email format");
      return false;
    }

    if (card.phone && !validatePhone(card.phone)) {
      console.error("❌ Invalid phone format");
      return false;
    }

    if (card.website && !validateUrl(card.website)) {
      console.error("❌ Invalid website URL");
      return false;
    }

    // Validate and sanitize all string fields
    const sanitizedCard = {
      ...card,
      name: validateBasicInput(card.name, 100) ? sanitizeInput(card.name.trim(), 100) : '',
      email: card.email ? (validateEmail(card.email) ? sanitizeInput(card.email.trim(), 254) : '') : '',
      phone: card.phone ? (validatePhone(card.phone) ? sanitizeInput(card.phone.trim(), 50) : '') : '',
      company: card.company ? sanitizeInput(card.company.trim(), 100) : '',
      jobTitle: card.jobTitle ? sanitizeInput(card.jobTitle.trim(), 100) : '',
      website: card.website ? (validateUrl(card.website) ? sanitizeInput(card.website.trim(), 255) : '') : '',
      address: card.address ? sanitizeInput(card.address.trim(), 255) : '',
      description: card.description ? sanitizeInput(card.description.trim(), 500) : '',
      userId: user.id // Ensure correct user ID
    };

    // RLS policies will automatically handle authorization and rate limiting
    const supabaseCard = prepareSupabaseCard(sanitizedCard);
    
    // Secure upsert with enhanced error handling
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("❌ Supabase error:", sanitizeErrorMessage(error));
      return handleSupabaseError(error, "Card could not be saved due to a security restriction");
    } else {
      console.log("✅ Card saved securely:", data);
      return true;
    }
  } catch (supabaseError) {
    console.error("💥 Secure save card error:", sanitizeErrorMessage(supabaseError));
    return handleSupabaseError(supabaseError, "Error saving card securely");
  }
};

export const getUserCardsFromSupabaseSecure = async (userId: string): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Securely loading user cards from Supabase...", userId);
    
    // Enhanced session validation
    const isValidSession = await authService.validateSession();
    if (!isValidSession) {
      console.error("❌ Invalid session for user cards fetch");
      return null;
    }

    // Validate user ID format
    if (!userId || typeof userId !== 'string' || userId.length !== 36) {
      console.error("❌ Invalid user ID format");
      return null;
    }
    
    // RLS policies will automatically filter to only accessible cards
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("❌ Database query error:", sanitizeErrorMessage(error));
      return null;
    }
    
    console.log("✅ User cards data securely loaded:", data?.length || 0);
    
    if (isEmptyData(data)) {
      console.log("📭 No cards found for user");
      return [];
    }
    
    const mappedCards = (data as SupabaseBusinessCard[]).map(item => mapSupabaseToBusinessCard(item));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in secure getUserCardsFromSupabase:", sanitizeErrorMessage(supabaseError));
    return null;
  }
};

export const getCardByIdFromSupabaseSecure = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Securely loading card ${id} from Supabase...`);
    
    // Validate card ID format
    if (!id || typeof id !== 'string') {
      console.error("❌ Invalid card ID format");
      return null;
    }

    // Enhanced session validation
    const isValidSession = await authService.validateSession();
    if (!isValidSession) {
      console.error("❌ Invalid session for card fetch");
      return null;
    }

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
    
    console.log("✅ Card found securely:", data.name);
    const mappedCard = mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
    return mappedCard;
  } catch (supabaseError) {
    console.error("💥 Error in secure getCardByIdFromSupabase:", sanitizeErrorMessage(supabaseError));
    return null;
  }
};

export const deleteCardFromSupabaseSecure = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Securely deleting card with ID ${id} from Supabase`);
    
    // Validate card ID format
    if (!id || typeof id !== 'string') {
      console.error("❌ Invalid card ID format");
      return false;
    }

    // Enhanced session validation
    const isValidSession = await authService.validateSession();
    if (!isValidSession) {
      console.error("❌ Invalid session for card deletion");
      return false;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated for deletion");
      return false;
    }

    // RLS policies will automatically handle authorization
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleSupabaseError(error, "Error deleting card due to security restrictions");
    }
    
    console.log("✅ Card deleted securely");
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error connecting to database securely");
  }
};
