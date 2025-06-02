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
    console.log("Attempting to sign in with:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
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

      console.log("Sign in successful:", data);
      toast.success("Sesión iniciada correctamente");
    } catch (error) {
      console.error("Exception during sign in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log("Attempting to sign up with:", email);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        toast.error(error.message || "Error al registrarse");
        throw error;
      }

      toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
    } catch (error) {
      console.error("Exception during sign up:", error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log("Attempting to sign out");
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast.error(error.message || "Error al cerrar sesión");
        throw error;
      }
      
      console.log("Sign out successful");
      toast.success("Sesión cerrada correctamente");
      window.location.href = '/landing';
    } catch (error) {
      console.error("Exception during sign out:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log("Attempting to reset password for:", email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        console.error("Reset password error:", error);
        toast.error(error.message || "Error al enviar el correo de recuperación");
        throw error;
      }

      toast.success("Instrucciones enviadas a tu correo electrónico");
    } catch (error) {
      console.error("Exception during password reset:", error);
      throw error;
    }
  };

  const refreshUserRole = async () => {
    if (user?.id) {
      try {
        console.log("Refreshing user role for:", user.id);
        const role = await getUserRole(user.id);
        console.log("User role received:", role);
        setUserRole(role);
      } catch (error) {
        console.error("Error loading user role:", error);
        setUserRole('user'); // Default fallback
      }
    }
  };

  const isAdmin = (): boolean => {
    return userRole === 'superadmin';
  };

  const isSuperAdmin = (): boolean => {
    return userRole === 'superadmin';
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state");
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Load user role if user exists and avoid RLS recursion
      if (session?.user?.id) {
        console.log("Loading role for user:", session.user.id);
        // Add small delay to ensure RLS policies are stable
        setTimeout(async () => {
          try {
            const role = await getUserRole(session.user.id);
            console.log("Initial user role:", role);
            setUserRole(role || 'user');
          } catch (error) {
            console.error("Error loading initial user role:", error);
            // Set default role if there's an error
            setUserRole('user');
          }
        }, 100);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user?.id && event === 'SIGNED_IN') {
          console.log("User signed in, loading role");
          // Add small delay to ensure RLS policies are stable
          setTimeout(async () => {
            try {
              const role = await getUserRole(session.user.id);
              console.log("User role loaded:", role);
              setUserRole(role || 'user');
            } catch (error) {
              console.error("Error loading user role:", error);
              setUserRole('user');
            }
          }, 100);
        } else if (!session?.user) {
          console.log("No user, clearing role");
          setUserRole(null);
        }
      }
    );

    return () => {
      console.log("AuthProvider: Cleaning up subscription");
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
    isAdmin,
    isSuperAdmin,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
