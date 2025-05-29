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
      console.log("AuthProvider: Loading user role for user ID:", userId);
      const role = await getUserRole(userId);
      console.log("AuthProvider: User role loaded:", role);
      setUserRole(role);
      
      // Si el email es tubal@tubalechaburu.com y no tiene rol de superadmin, mostramos advertencia
      if (user?.email === "tubal@tubalechaburu.com" && role !== "superadmin") {
        console.warn("¡ATENCIÓN! El usuario tubal@tubalechaburu.com debería tener rol de superadmin pero tiene:", role);
        toast.warning("Tu cuenta debería tener permisos de superadmin. Contacta con el administrador del sistema.");
      }
    } catch (error) {
      console.error("AuthProvider: Error loading user role:", error);
    }
  };

  // Función para refrescar el rol del usuario
  const refreshUserRole = async () => {
    if (user?.id) {
      console.log("AuthProvider: Refreshing user role...");
      await loadUserRole(user.id);
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up authentication...");
    
    let mounted = true;
    
    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("AuthProvider: Auth state changed, event:", event);
        console.log("AuthProvider: Session:", session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          console.log("AuthProvider: Session updated, loading user role...");
          await loadUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log("AuthProvider: Getting initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider: Error getting session:", error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        console.log("AuthProvider: Initial session:", session);
        
        if (mounted) {
          // Si no hay sesión, marcar como no loading
          if (!session) {
            setSession(null);
            setUser(null);
            setUserRole(null);
            setIsLoading(false);
          }
          // Si hay sesión, el onAuthStateChange la manejará
        }
      } catch (error) {
        console.error("AuthProvider: Error getting initial session:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      console.log("AuthProvider: Cleaning up subscription");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Método para iniciar sesión con mejor manejo de errores
  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthProvider: Attempting to sign in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("AuthProvider: Supabase auth error:", error);
        
        // Mejorar mensajes de error específicos
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

      console.log("AuthProvider: Sign in successful:", data);
      toast.success("Sesión iniciada correctamente");
      
    } catch (error: any) {
      console.error("AuthProvider: Error signing in:", error);
      throw error;
    }
  };

  // Método para registrarse
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

  // Método para cerrar sesión
  const signOut = async () => {
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
