
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
      
      // Solo mostrar warning una vez y solo para el email específico
      if (user?.email === "tubal@tubalechaburu.com" && role !== "superadmin") {
        toast.warning("Tu cuenta debería tener permisos de superadmin. Contacta con el administrador del sistema.");
      }
    } catch (error) {
      console.error("Error loading user role:", error);
      setUserRole(null);
    }
  };

  const refreshUserRole = async () => {
    if (user?.id) {
      await loadUserRole(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Función para manejar cambios de autenticación
    const handleAuthChange = async (event: string, session: any) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Solo cargar rol si hay usuario y no lo tenemos ya
      if (session?.user?.id && (!userRole || event === 'SIGNED_IN')) {
        await loadUserRole(session.user.id);
      } else if (!session?.user) {
        setUserRole(null);
      }
      
      setIsLoading(false);
    };

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Obtener sesión inicial solo una vez
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
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user?.id) {
            await loadUserRole(session.user.id);
          }
          
          setIsLoading(false);
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
  }, []); // Remover dependencias para evitar re-renders innecesarios

  return {
    user,
    session,
    isLoading,
    userRole,
    setIsLoading,
    refreshUserRole
  };
};
