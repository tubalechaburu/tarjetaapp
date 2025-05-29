
import React, { createContext, useContext } from "react";
import { AuthContextType } from "@/types";
import { useAuthState } from "@/hooks/useAuthState";
import { signIn, signUp, signOut, resetPassword } from "@/utils/authOperations";
import { isAdmin, isSuperAdmin } from "@/utils/roleUtils";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    session,
    isLoading,
    userRole,
    setIsLoading,
    refreshUserRole
  } = useAuthState();

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn(email, password);
      // No necesitamos setIsLoading(false) aquí porque useAuthState lo maneja
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    try {
      await signUp(email, password, metadata);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } finally {
      setIsLoading(false);
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
    resetPassword,
    isAdmin: () => isAdmin(userRole),
    isSuperAdmin: () => isSuperAdmin(userRole),
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
