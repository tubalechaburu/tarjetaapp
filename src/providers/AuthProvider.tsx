
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, UserRole } from "@/types";
import { supabase, getUserRole } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        toast.error("Credenciales incorrectas. Verifica tu email y contraseña.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Debes confirmar tu email antes de iniciar sesión.");
      } else if (error.message.includes("too many requests")) {
        toast.error("Demasiados intentos. Espera unos minutos antes de intentar de nuevo.");
      } else {
        toast.error(`Error de autenticación: ${error.message}`);
      }
      throw error;
    }

    toast.success("Sesión iniciada correctamente");
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      toast.error(error.message || "Error al registrarse");
      throw error;
    }

    toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Error al cerrar sesión");
      throw error;
    }
    toast.success("Sesión cerrada correctamente");
    window.location.href = '/landing';
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || "Error al enviar el correo de recuperación");
      throw error;
    }

    toast.success("Instrucciones enviadas a tu correo electrónico");
  };

  const refreshUserRole = async () => {
    if (user?.id) {
      try {
        const role = await getUserRole(user.id);
        setUserRole(role);
      } catch (error) {
        console.error("Error loading user role:", error);
      }
    }
  };

  const isAdmin = (): boolean => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  const isSuperAdmin = (): boolean => {
    return userRole === 'superadmin';
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Load user role if user exists
      if (session?.user?.id) {
        getUserRole(session.user.id).then(role => {
          setUserRole(role);
        }).catch(console.error);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user?.id && event === 'SIGNED_IN') {
          try {
            const role = await getUserRole(session.user.id);
            setUserRole(role);
          } catch (error) {
            console.error("Error loading user role:", error);
          }
        } else if (!session?.user) {
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
