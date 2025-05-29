
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

  const loadUserRole = async (userId: string) => {
    try {
      const role = await getUserRole(userId);
      setUserRole(role);
    } catch (error) {
      console.error("Error loading user role:", error);
      setUserRole(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
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
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        toast.error(error.message || "Error al registrarse");
        console.error("Error al registrarse:", error);
        throw error;
      }

      toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message || "Error al cerrar sesión");
        console.error("Error al cerrar sesión:", error);
        throw error;
      }
      toast.success("Sesión cerrada correctamente");
      window.location.href = '/landing';
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message || "Error al enviar el correo de recuperación");
      console.error("Error al enviar el correo de recuperación:", error);
      throw error;
    }

    toast.success("Instrucciones enviadas a tu correo electrónico");
  };

  const refreshUserRole = async () => {
    if (user?.id) {
      await loadUserRole(user.id);
    }
  };

  const isAdmin = (role: UserRole | null): boolean => {
    return role === 'admin' || role === 'superadmin';
  };

  const isSuperAdmin = (role: UserRole | null): boolean => {
    return role === 'superadmin';
  };

  useEffect(() => {
    let mounted = true;

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.id && event === 'SIGNED_IN') {
          await loadUserRole(session.user.id);
        } else if (!session?.user) {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    isAdmin: () => isAdmin(userRole),
    isSuperAdmin: () => isSuperAdmin(userRole),
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
