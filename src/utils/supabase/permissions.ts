
import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";
import { BusinessCard } from "../../types";

export const checkCardOwnership = async (card: BusinessCard, userId: string): Promise<boolean> => {
  if (card.id && card.userId && card.userId !== userId) {
    console.error("❌ User trying to edit card they don't own");
    toast.error("No tienes permisos para editar esta tarjeta");
    return false;
  }
  return true;
};

export const checkDeletePermissions = async (cardId: string, userId: string): Promise<boolean> => {
  const { data: isSuperAdmin } = await supabase.rpc('is_current_user_superadmin');

  if (!isSuperAdmin) {
    const { data: card } = await supabase
      .from('cards')
      .select('user_id')
      .eq('id', cardId)
      .single();

    if (card && card.user_id !== userId) {
      console.error("❌ User trying to delete card they don't own");
      toast.error("No tienes permisos para eliminar esta tarjeta");
      return false;
    }
  }
  
  return true;
};
