
import { BusinessCard, SupabaseBusinessCard } from "../types";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./supabase/mappers";
import { handleSupabaseError, handleSupabaseSuccess, isEmptyData } from "./supabase/helpers";

export const saveCardSupabase = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Saving card to Supabase:", card.name);
    
    // Prepare data for Supabase
    const supabaseCard = prepareSupabaseCard(card);
    
    // Try to upsert to Supabase
    const { data, error } = await supabase
      .from('cards')
      .upsert(supabaseCard)
      .select();
    
    if (error) {
      console.error("❌ Supabase error:", error);
      return handleSupabaseError(error, "No se pudo guardar la tarjeta");
    } else {
      console.log("✅ Card saved successfully:", data);
      handleSupabaseSuccess(data, "Tarjeta guardada correctamente");
      return true;
    }
  } catch (supabaseError) {
    console.error("💥 Save card error:", supabaseError);
    return handleSupabaseError(supabaseError, "Error al guardar la tarjeta");
  }
};

export const getCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Loading cards from Supabase...");
    
    // Verificar rol del usuario primero
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      toast.error("Usuario no autenticado");
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email);

    // Verificar perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', userData.user.id)
      .single();

    if (profileError) {
      console.error("❌ Error getting user profile:", profileError);
      toast.error("Error al obtener perfil de usuario");
      return null;
    }

    console.log("🎭 User profile:", profile);

    // Si es superadmin, usar función especial que bypasea RLS
    if (profile.role === 'superadmin') {
      console.log("🔐 Superadmin detected, fetching all cards...");
      
      const { data: allCards, error: allCardsError } = await supabase.rpc('get_all_cards');
      
      if (allCardsError) {
        console.error("❌ Error fetching all cards:", allCardsError);
        toast.error("Error al cargar todas las tarjetas");
        return null;
      }
      
      console.log("✅ All cards fetched for superadmin:", allCards?.length || 0);
      
      if (!allCards || allCards.length === 0) {
        return [];
      }
      
      const mappedCards = allCards.map(item => mapSupabaseToBusinessCard(item as unknown as SupabaseBusinessCard));
      console.log("🗂️ Mapped cards for superadmin:", mappedCards.length);
      return mappedCards;
    }
    
    // Para usuarios normales, consulta directa con RLS
    console.log("👤 Regular user, fetching own cards...");
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error("❌ Database query error:", error);
      toast.error("Error al obtener las tarjetas");
      return null;
    }
    
    console.log("✅ User cards data:", data?.length || 0);
    
    if (isEmptyData(data)) {
      console.log("📭 No cards found for user");
      return [];
    }
    
    const mappedCards = (data as SupabaseBusinessCard[]).map(item => mapSupabaseToBusinessCard(item));
    console.log("🗂️ Final mapped user cards:", mappedCards.length);
    
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getCardsSupabase:", supabaseError);
    toast.error("Error al conectar con la base de datos");
    return null;
  }
};

export const getAllCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Loading ALL cards for admin...");
    
    // Usar la función RPC que bypasea RLS para admins
    const { data, error } = await supabase.rpc('get_all_cards');
    
    if (error) {
      console.error("❌ Database query error:", error);
      toast.error("Error al obtener todas las tarjetas");
      return null;
    }
    
    console.log("✅ Raw all cards data:", data);
    console.log("📊 Total cards found:", data?.length || 0);
    
    if (isEmptyData(data)) {
      console.log("📭 No cards found in database");
      return [];
    }
    
    // Map the data
    const mappedCards = (data as SupabaseBusinessCard[]).map(item => {
      console.log("🔄 Mapping card:", item.id, item.name);
      return mapSupabaseToBusinessCard(item as unknown as SupabaseBusinessCard);
    });
    
    console.log("✅ Final mapped all cards:", mappedCards.length, "cards");
    
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getAllCardsSupabase:", supabaseError);
    toast.error("Error al conectar con la base de datos");
    return null;
  }
};

export const getCardByIdSupabase = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`Fetching card with ID ${id} from Supabase`);
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Supabase query error:", error);
      handleSupabaseError(error, "Error al obtener la tarjeta");
      return null;
    }
    
    if (!data) {
      console.log(`Card with ID ${id} not found in Supabase`);
      return null;
    }
    
    console.log(`Card with ID ${id} found in Supabase:`, data);
    handleSupabaseSuccess(data, "Tarjeta cargada correctamente");
    
    const card = mapSupabaseToBusinessCard(data as unknown as SupabaseBusinessCard);
    return card;
  } catch (supabaseError) {
    handleSupabaseError(supabaseError, "Error al conectar con la base de datos");
    return null;
  }
};

export const deleteCardSupabase = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting card with ID ${id} from Supabase`);
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleSupabaseError(error, "Error al eliminar la tarjeta");
    }
    
    handleSupabaseSuccess(null, "Tarjeta eliminada correctamente");
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error al conectar con la base de datos");
  }
};
