
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContextType, UserRole } from "@/types";
import { supabase, getUserRole } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Creamos el contexto de autenticación
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Componente proveedor de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Función para cargar el rol del usuario
  const loadUserRole = async (userId: string) => {
    if (!userId) return;
    
    try {
      const role = await getUserRole(userId);
      console.log("User role loaded:", role);
      setUserRole(role);
    } catch (error) {
      console.error("Error loading user role:", error);
    }
  };

  useEffect(() => {
    // Obtener la sesión actual al montar el componente
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          loadUserRole(session.user.id);
        }
      } catch (error) {
        console.error("Error al obtener la sesión inicial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user?.id) {
          // Actualizamos el rol cuando cambia la sesión
          loadUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Método para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Sesión iniciada correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  // Método para registrarse
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
    } catch (error: any) {
      toast.error(error.message || "Error al registrarse");
      console.error("Error al registrarse:", error);
      throw error;
    }
  };

  // Método para cerrar sesión
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUserRole(null);
      toast.success("Sesión cerrada correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar sesión");
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  // Método para restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success("Instrucciones enviadas a tu correo electrónico");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el correo de recuperación");
      console.error("Error al enviar el correo de recuperación:", error);
      throw error;
    }
  };

  // Funciones de verificación de roles
  const isAdmin = () => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  const isSuperAdmin = () => {
    return userRole === 'superadmin';
  };

  const value = {
    user,
    session,
    isLoading,
    userRole,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
