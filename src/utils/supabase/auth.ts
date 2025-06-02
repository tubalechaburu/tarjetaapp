
import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";

export const verifyAuthentication = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("❌ User not authenticated");
    toast.error("Debes estar autenticado para realizar esta acción");
    return null;
  }
  return user;
};

export const checkSuperAdminStatus = async () => {
  const { data: isSuperAdmin, error: roleError } = await supabase
    .rpc('is_current_user_superadmin');
  
  if (roleError) {
    console.error("❌ Error checking superadmin status:", roleError);
    return false;
  }
  
  return isSuperAdmin || false;
};
