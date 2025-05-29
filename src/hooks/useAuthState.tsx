
import { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { supabase, getUserRole } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthState = () => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const loadUserRole = async (userId: string) => {
    if (!userId) return;
    
    try {
      const role = await getUserRole(userId);
      setUserRole(role);
      
      if (user?.email === "tubal@tubalechaburu.com" && role !== "superadmin") {
        toast.warning("Tu cuenta debería tener permisos de superadmin. Contacta con el administrador del sistema.");
      }
    } catch (error) {
      console.error("Error loading user role:", error);
    }
  };

  const refreshUserRole = async () => {
    if (user?.id) {
      await loadUserRole(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          await loadUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          if (!session) {
            setSession(null);
            setUser(null);
            setUserRole(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    userRole,
    setIsLoading,
    setUserRole,
    refreshUserRole
  };
};
