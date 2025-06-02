
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
      const role = await loadUserRole(user.id);
      setUserRole(role);
    }
  };

  const handleAuthStateChange = async (event: string, session: any) => {
    console.log("Auth state changed:", event, session);
    setSession(session);
    setUser(session?.user ?? null);
    setIsLoading(false);
    
    if (session?.user?.id && event === 'SIGNED_IN') {
      console.log("User signed in, loading role");
      // Add small delay to ensure RLS policies are stable
      setTimeout(async () => {
        const role = await loadUserRole(session.user.id);
        setUserRole(role || 'user');
      }, 100);
    } else if (!session?.user) {
      console.log("No user, clearing role");
      setUserRole(null);
    }
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
          const role = await loadUserRole(session.user.id);
          setUserRole(role || 'user');
        }, 100);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

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
    isAdmin: () => isAdmin(userRole),
    isSuperAdmin: () => isSuperAdmin(userRole),
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
