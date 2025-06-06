
import React, { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import { authService } from "@/utils/security/authService";
import { sanitizeErrorMessage } from "@/utils/security/validation";

export const AuthProviderSecure: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    console.log("🚀 SecureAuthProvider: Initializing secure auth");
    
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return;
      
      console.log("🔐 Secure auth state changed:", event, session?.user?.email || "no user");
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log("👤 User authenticated securely, fetching role with security checks");
        setUserRole('user'); // Default secure role
        
        // Fetch actual role with additional security validation
        setTimeout(async () => {
          try {
            // Verify session is still valid before making role call
            const isValidSession = await authService.validateSession();
            if (!isValidSession || !mounted) {
              console.warn("⚠️ Session validation failed during role fetch");
              return;
            }

            const { data: isSuperAdminResult, error } = await supabase
              .rpc('is_superadmin', { _user_id: session.user.id });
            
            if (!error && mounted) {
              const actualRole = isSuperAdminResult ? 'superadmin' : 'user';
              setUserRole(actualRole);
              console.log("✅ Secure user role updated:", actualRole);
            } else if (error) {
              console.log("⚠️ Could not fetch role securely, keeping default:", sanitizeErrorMessage(error));
            }
          } catch (error) {
            console.log("⚠️ Error in secure role fetch, keeping default:", sanitizeErrorMessage(error));
          }
        }, 100);
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    };

    // Configure Supabase client with enhanced security settings
    const configureSecureAuth = async () => {
      try {
        // Set up auth state listener with security enhancements
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        // Get initial session with validation
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial secure session:", sanitizeErrorMessage(error));
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // Validate session before using it
        if (session) {
          const isValid = await authService.validateSession();
          if (isValid && mounted) {
            await handleAuthStateChange('INITIAL_SESSION', session);
          } else if (mounted) {
            console.warn("⚠️ Initial session validation failed");
            setIsLoading(false);
          }
        } else if (mounted) {
          setIsLoading(false);
        }

        return subscription;
      } catch (error) {
        console.error("Error initializing secure auth:", sanitizeErrorMessage(error));
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const initPromise = configureSecureAuth();

    return () => {
      console.log("🧹 SecureAuthProvider: Cleaning up");
      mounted = false;
      initPromise.then(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    };
  }, []);

  const handleSignIn = async (email: string, password: string): Promise<void> => {
    await authService.signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string, metadata?: any): Promise<void> => {
    await authService.signUp(email, password, metadata);
  };

  const handleSignOut = async (): Promise<void> => {
    setUserRole(null);
    setUser(null);
    setSession(null);
    await authService.signOut();
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const refreshUserRole = async () => {
    if (!user) return;
    
    try {
      // Additional security check before role refresh
      const isValid = await authService.validateSession();
      if (!isValid) {
        console.warn("⚠️ Session validation failed during role refresh");
        return;
      }

      const { data: isSuperAdminResult, error } = await supabase
        .rpc('is_superadmin', { _user_id: user.id });
      
      if (error) {
        console.error("Error refreshing user role securely:", sanitizeErrorMessage(error));
      } else {
        setUserRole(isSuperAdminResult ? 'superadmin' : 'user');
      }
    } catch (error) {
      console.error("Error refreshing user role securely:", sanitizeErrorMessage(error));
    }
  };

  const isAdmin = () => userRole === 'superadmin';
  const isSuperAdmin = () => userRole === 'superadmin';

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

export default AuthProviderSecure;
