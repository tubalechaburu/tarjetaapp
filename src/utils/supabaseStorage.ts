// 1. Actualizar supabaseStorage.ts para mejor manejo de errores y seguridad

import { BusinessCard, SupabaseBusinessCard } from "../types";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { mapSupabaseToBusinessCard, prepareSupabaseCard } from "./supabase/mappers";
import { handleSupabaseError, handleSupabaseSuccess, isEmptyData } from "./supabase/helpers";

export const saveCardSupabase = async (card: BusinessCard): Promise<boolean> => {
  try {
    console.log("💾 Saving card to Supabase:", card.name);
    
    // Verificar autenticación antes de guardar
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      toast.error("Debes estar autenticado para guardar tarjetas");
      return false;
    }

    // Verificar que el usuario solo pueda editar sus propias tarjetas
    if (card.id && card.userId && card.userId !== user.id) {
      console.error("❌ User trying to edit card they don't own");
      toast.error("No tienes permisos para editar esta tarjeta");
      return false;
    }

    // Prepare data for Supabase
    const supabaseCard = prepareSupabaseCard({
      ...card,
      userId: user.id // Ensure correct user ID
    });
    
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
    
    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
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
      // Si no existe perfil, usar rol por defecto
      console.log("Creating default profile...");
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userData.user.id,
          email: userData.user.email || '',
          role: 'user'
        });
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
      }
    }

    const userRole = profile?.role || 'user';
    console.log("🎭 User role:", userRole);

    // Si es superadmin, usar función especial
    if (userRole === 'superadmin') {
      console.log("🔐 Superadmin detected, fetching all cards...");
      
      const { data: allCards, error: allCardsError } = await supabase.rpc('get_all_cards');
      
      if (allCardsError) {
        console.error("❌ Error fetching all cards:", allCardsError);
        return null;
      }
      
      console.log("✅ All cards fetched for superadmin:", allCards?.length || 0);
      
      if (!allCards || allCards.length === 0) {
        return [];
      }
      
      const mappedCards = allCards.map(item => mapSupabaseToBusinessCard(item as unknown as SupabaseBusinessCard));
      return mappedCards;
    }
    
    // Para usuarios normales, consulta con RLS
    console.log("👤 Regular user, fetching own cards...");
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error("❌ Database query error:", error);
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
    console.error("💥 Error in getCardsSupabase:", supabaseError);
    return null;
  }
};

export const getCardByIdSupabase = async (id: string): Promise<BusinessCard | null> => {
  try {
    console.log(`🔍 Loading card ${id} from Supabase...`);
    
    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email);

    // Obtener la tarjeta directamente - RLS manejará los permisos
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("❌ Database query error:", error);
      return null;
    }
    
    if (!data) {
      console.log(`📭 Card ${id} not found`);
      return null;
    }
    
    console.log("✅ Card found:", data.name);
    const mappedCard = mapSupabaseToBusinessCard(data as SupabaseBusinessCard);
    return mappedCard;
  } catch (supabaseError) {
    console.error("💥 Error in getCardByIdSupabase:", supabaseError);
    return null;
  }
};

export const deleteCardSupabase = async (id: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting card with ID ${id} from Supabase`);
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ User not authenticated");
      toast.error("Debes estar autenticado para eliminar tarjetas");
      return false;
    }

    // Verificar que la tarjeta pertenece al usuario (excepto superadmin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      const { data: card } = await supabase
        .from('cards')
        .select('user_id')
        .eq('id', id)
        .single();

      if (card && card.user_id !== user.id) {
        console.error("❌ User trying to delete card they don't own");
        toast.error("No tienes permisos para eliminar esta tarjeta");
        return false;
      }
    }
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleSupabaseError(error, "Error al eliminar la tarjeta");
    }
    
    return true;
  } catch (supabaseError) {
    return handleSupabaseError(supabaseError, "Error al conectar con la base de datos");
  }
};

export const getAllCardsSupabase = async (): Promise<BusinessCard[] | null> => {
  try {
    console.log("🔍 Admin loading all cards from Supabase...");
    
    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ No user authenticated:", userError);
      return null;
    }

    console.log("👤 User authenticated:", userData.user.email);

    // Verificar si es superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      console.error("❌ User is not superadmin");
      return null;
    }

    console.log("🔐 Superadmin verified, fetching all cards...");
    
    const { data: allCards, error: allCardsError } = await supabase.rpc('get_all_cards');
    
    if (allCardsError) {
      console.error("❌ Error fetching all cards:", allCardsError);
      return null;
    }
    
    console.log("✅ All cards fetched:", allCards?.length || 0);
    
    if (!allCards || allCards.length === 0) {
      return [];
    }
    
    const mappedCards = allCards.map(item => mapSupabaseToBusinessCard(item as unknown as SupabaseBusinessCard));
    return mappedCards;
  } catch (supabaseError) {
    console.error("💥 Error in getAllCardsSupabase:", supabaseError);
    return null;
  }
};
