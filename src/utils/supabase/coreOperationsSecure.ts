
import { BusinessCard, SupabaseBusinessCard } from "../../types";
import { supabase } from "../../integrations/supabase/client";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./mappers";
import { handleSupabaseError, isEmptyData } from "./helpers";
import { 
  sanitizeUserInput, 
  validateEmail, 
  validatePhoneNumber, 
  validateURL,
  sanitizeErrorMessage 
} from "./securityEnhancements";

export const saveCardToSupabaseSecure = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Saving card to Supabase with enhanced security:", card.name);
    
    // Enhanced input validation with sanitization
    if (!card.name || sanitizeUserInput(card.name, 100).length < 2) {
      console.error("❌ Invalid card name");
      return false;
    }
    
    if (card.email && !validateEmail(card.email)) {
      console.error("❌ Invalid email format");
      return false;
    }
    
    if (card.phone && !validatePhoneNumber(card.phone)) {
      console.error("❌ Invalid phone number format");
      return false;
    }
    
    if (card.website && !validateURL(card.website)) {
      console.error("❌ Invalid website URL format");
      return false;
    }
    
    // Secure authentication check with session validation
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      return false;
    }

    // Additional session validation
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.id !== user.id) {
      console.error("❌ Session validation failed");
      return false;
    }

    // Sanitize all input fields
    const sanitizedCard = {
      ...card,
      name: sanitizeUserInput(card.name, 100),
      jobTitle: sanitizeUserInput(card.jobTitle || '', 100),
      company: sanitizeUserInput(card.company || '', 100),
      email: card.email ? sanitizeUserInput(card.email, 254) : '',
      phone: card.phone ? sanitizeUserInput(card.phone, 20) : '',
      website: card.website ? sanitizeUserInput(card.website, 200) : '',
      address: card.address ? sanitizeUserInput(card.address, 200) : '',
      description: card.description ? sanitizeUserInput(card.description, 500) : '',
      userId: user.id
    };
    
    const supabaseCard = prepareSupabaseCard(sanitizedCard);
    
    // Rate limiting check - users should only be able to create/update cards at reasonable intervals
    const { data: recentCards, error: recentError } = await supabase
      .from('cards')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .limit(5);
    
    if (!recentError && recentCards && recentCards.length >= 3) {
      console.error("❌ Rate limit exceeded");
      return false;
    }
    
    // Secure upsert with RLS protection
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("❌ Supabase error:", sanitizeErrorMessage(error));
      return handleSupabaseError(error, "Card could not be saved");
    } else {
      console.log("✅ Card saved successfully with security validations");
      return true;
    }
  } catch (supabaseError) {
    console.error("💥 Save card error:", sanitizeErrorMessage(supabaseError));
    return handleSupabaseError(supabaseError, "Error saving card");
  }
};

export const getUserCardsFromSupabaseSecure = async (userId: string): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Loading user cards with security checks...", userId);
    
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.length !== 36) {
      console.error("❌ Invalid user ID format");
      return null;
    }
    
    // Verify current user has access to this data
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      console.error("❌ Unauthorized access attempt");
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
    
    console.log("✅ User cards data loaded securely:", data?.length || 0);
    
    if (isEmptyData(data)) {
      console.log("📭 No cards found for user");
      return [];
    }
    
    const mappedCards = (data as SupabaseBusinessCard[]).map(item => mapSupabaseToBusinessCard(item));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getUserCardsFromSupabaseSecure:", sanitizeErrorMessage(supabaseError));
    return null;
  }
};

export const getCardByIdFromSupabaseSecure = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Loading card ${id} with security validation...`);
    
    // Validate input
    if (!id || typeof id !== 'string' || id.length !== 36) {
      console.error("❌ Invalid card ID format");
      return null;
    }
    
    // Secure authentication check
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", sanitizeErrorMessage(userError));
      return null;
    }

    console.log("👤 User authenticated for secure card access:", userData.user.email);

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
    
    console.log("✅ Card found with security validation:", data.name);
    const mappedCard = mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
    return mappedCard;
  } catch (supabaseError) {
    console.error("💥 Error in getCardByIdFromSupabaseSecure:", sanitizeErrorMessage(supabaseError));
    return null;
  }
};

export const deleteCardFromSupabaseSecure = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting card with ID ${id} with security checks`);
    
    // Validate input
    if (!id || typeof id !== 'string' || id.length !== 36) {
      console.error("❌ Invalid card ID format");
      return false;
    }
    
    // Secure authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      return false;
    }

    // Additional check: verify user owns this card before deletion
    const { data: cardCheck, error: checkError } = await supabase
      .from('cards')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError || !cardCheck) {
      console.error("❌ Card not found or access denied");
      return false;
    }
    
    // Check if user is either the owner or superadmin
    const { data: isSuperAdmin } = await supabase
      .rpc('is_superadmin', { _user_id: user.id });
    
    if (cardCheck.user_id !== user.id && !isSuperAdmin) {
      console.error("❌ User not authorized to delete this card");
      return false;
    }

    // RLS policies will automatically handle authorization, but we've added extra checks
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleSupabaseError(error, "Error deleting card");
    }
    
    console.log("✅ Card deleted successfully with security validation");
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error connecting to database");
  }
};
