import React, { createContext, useState, useEffect, useContext } from "react";
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

  const signIn = async (email: string, password: string) => {
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
      
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUserRole(null);
      toast.success("Sesión cerrada correctamente");
      window.location.href = '/landing';
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar sesión");
      console.error("Error al cerrar sesión:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
    signUp: async (email: string, password: string, metadata?: any) => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      try {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        setUserRole(null);
        toast.success("Sesión cerrada correctamente");
        // Redirigir a la landing page después del logout
        window.location.href = '/landing';
      } catch (error: any) {
        toast.error(error.message || "Error al cerrar sesión");
        console.error("Error al cerrar sesión:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    resetPassword: async (email: string) => {
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
    },
    isAdmin,
    isSuperAdmin,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
