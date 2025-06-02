
import React, { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword
} from "@/utils/authUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    console.log("🚀 AuthProvider: Initializing auth");
    
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return;
      
      console.log("🔐 Auth state changed:", event, session?.user?.email || "no user");
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load user role if user is authenticated
      if (session?.user) {
        try {
          // Verificar si es superadmin usando la función de la base de datos
          const { data: isSuperAdmin, error: roleError } = await supabase
            .rpc('is_current_user_superadmin');
          
          if (roleError) {
            console.error("Error checking superadmin status:", roleError);
            setUserRole('user'); // Default fallback
          } else {
            setUserRole(isSuperAdmin ? 'superadmin' : 'user');
            console.log("✅ User role determined:", isSuperAdmin ? 'superadmin' : 'user');
          }
        } catch (error) {
          console.error("Error loading user role:", error);
          setUserRole('user'); // Default fallback
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const initializeAuth = async () => {
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
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log("🧹 AuthProvider: Cleaning up");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Simple wrapper functions
  const handleSignIn = async (email: string, password: string): Promise<void> => {
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string, metadata?: any): Promise<void> => {
    await signUp(email, password, metadata);
  };

  const handleSignOut = async (): Promise<void> => {
    setUserRole(null);
    await signOut();
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    await resetPassword(email);
  };

  const refreshUserRole = async () => {
    if (!user) return;
    
    try {
      const { data: isSuperAdmin, error } = await supabase.rpc('is_current_user_superadmin');
      
      if (error) {
        console.error("Error refreshing user role:", error);
        return;
      }
      
      setUserRole(isSuperAdmin ? 'superadmin' : 'user');
      console.log("✅ User role refreshed:", isSuperAdmin ? 'superadmin' : 'user');
    } catch (error) {
      console.error("Error refreshing user role:", error);
    }
  };

  const isAdmin = (): boolean => {
    return userRole === 'superadmin';
  };

  const isSuperAdmin = (): boolean => {
    return userRole === 'superadmin';
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
    isAdmin,
    isSuperAdmin,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
