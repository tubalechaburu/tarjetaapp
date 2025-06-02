
import React, { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  loadUserRole, 
  isAdmin, 
  isSuperAdmin 
} from "@/utils/authUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const refreshUserRole = async () => {
    if (user?.id) {
      console.log("🔄 Refreshing user role for:", user.id);
      try {
        const role = await loadUserRole(user.id);
        console.log("🎭 New role loaded:", role);
        setUserRole(role);
      } catch (error) {
        console.error("Error refreshing user role:", error);
        setUserRole('user');
      }
    }
  };

  const handleAuthStateChange = async (event: string, session: any) => {
    console.log("🔐 Auth state changed:", event, session?.user?.email);
    
    // Siempre actualizar la sesión y usuario primero
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user?.id) {
      console.log("✅ User found, loading role for:", session.user.email);
      // Solo cargar el rol si es un evento de login o refresh, no en todos los eventos
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const role = await loadUserRole(session.user.id);
          console.log("🎭 Role loaded for", session.user.email, ":", role);
          setUserRole(role || 'user');
        } catch (error) {
          console.error("Error loading user role:", error);
          setUserRole('user');
        }
      }
    } else {
      console.log("❌ No user, clearing role");
      setUserRole(null);
    }
    
    // Siempre marcar como no loading al final
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("🚀 AuthProvider: Setting up auth state");
    
    // Configurar el listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Inicializar la sesión actual
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        console.log("📋 Initial session:", session?.user?.email || "No user");
        
        // Actualizar estado inmediatamente
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          console.log("👤 Loading initial role for:", session.user.email);
          try {
            const role = await loadUserRole(session.user.id);
            console.log("🎭 Initial role loaded:", role);
            setUserRole(role || 'user');
          } catch (error) {
            console.error("Error loading initial role:", error);
            setUserRole('user');
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("🧹 AuthProvider: Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("📊 Current auth state:", {
      user: user?.email,
      role: userRole,
      isLoading
    });
  }, [user, userRole, isLoading]);

  // Wrapper functions para mantener la interfaz esperada
  const handleSignIn = async (email: string, password: string): Promise<void> => {
    try {
      await signIn(email, password);
      // No forzar recarga aquí, el onAuthStateChange lo manejará
    } catch (error) {
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, metadata?: any): Promise<void> => {
    await signUp(email, password, metadata);
  };

  const handleSignOut = async (): Promise<void> => {
    setUserRole(null); // Limpiar rol inmediatamente
    await signOut();
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    await resetPassword(email);
  };

  const value = {
    user,
    session,
    isLoading,
    userRole,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    isAdmin: () => isAdmin(userRole),
    isSuperAdmin: () => isSuperAdmin(userRole),
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
