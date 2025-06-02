
import React, { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  isAdmin, 
  isSuperAdmin 
} from "@/utils/authUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    console.log("🚀 AuthProvider: Initializing auth");
    
    let mounted = true;

    const handleAuthStateChange = (event: string, session: any) => {
      if (!mounted) return;
      
      console.log("🔐 Auth state changed:", event, session?.user?.email || "no user");
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set default role based on email
      if (session?.user?.email === 'tubal@tubalechaburu.com') {
        setUserRole('superadmin');
      } else if (session?.user) {
        setUserRole('user');
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
          handleAuthStateChange('INITIAL_SESSION', session);
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
    // Simple refresh without complex loading
    if (user?.email === 'tubal@tubalechaburu.com') {
      setUserRole('superadmin');
    }
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
