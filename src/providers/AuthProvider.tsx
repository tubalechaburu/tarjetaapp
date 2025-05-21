
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContextType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    // Obtener la sesión actual al montar el componente
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error al obtener la sesión inicial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
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

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
