
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
      const role = await loadUserRole(user.id);
      console.log("🎭 New role loaded:", role);
      setUserRole(role);
    }
  };

  const handleAuthStateChange = async (event: string, session: any) => {
    console.log("🔐 Auth state changed:", event, session?.user?.email);
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user?.id && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      console.log("✅ User signed in, loading role for:", session.user.email);
      try {
        const role = await loadUserRole(session.user.id);
        console.log("🎭 Role loaded for", session.user.email, ":", role);
        setUserRole(role || 'user');
      } catch (error) {
        console.error("Error loading user role:", error);
        setUserRole('user');
      } finally {
        setIsLoading(false);
      }
    } else if (!session?.user) {
      console.log("❌ No user, clearing role");
      setUserRole(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 AuthProvider: Setting up auth state");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        console.log("📋 Initial session:", session?.user?.email || "No user");
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
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
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

  // Wrapper functions to match the expected interface
  const handleSignIn = async (email: string, password: string): Promise<void> => {
    await signIn(email, password);
    // Forzar recarga del rol después del login
    setTimeout(refreshUserRole, 1000);
  };

  const handleSignUp = async (email: string, password: string, metadata?: any): Promise<void> => {
    await signUp(email, password, metadata);
  };

  const handleSignOut = async (): Promise<void> => {
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
