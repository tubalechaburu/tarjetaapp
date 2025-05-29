
import { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { supabase, getUserRole } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthState = () => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const loadUserRole = async (userId: string) => {
    if (!userId) return;
    
    try {
      const role = await getUserRole(userId);
      setUserRole(role);
    } catch (error) {
      console.error("Error loading user role:", error);
      setUserRole(null);
    }
  };

  const refreshUserRole = async () => {
    if (user?.id) {
      await loadUserRole(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
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
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user?.id) {
            await loadUserRole(session.user.id);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.id && event === 'SIGNED_IN') {
          await loadUserRole(session.user.id);
        } else if (!session?.user) {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-runs

  return {
    user,
    session,
    isLoading,
    userRole,
    setIsLoading,
    refreshUserRole
  };
};
