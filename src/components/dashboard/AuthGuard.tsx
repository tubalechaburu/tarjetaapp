
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const checkUserProfile = async () => {
      console.log("🔒 AuthGuard checking user profile...");
      
      if (isLoading) {
        console.log("⏳ Auth is still loading...");
        return;
      }

      if (!user) {
        console.log("❌ No user found, redirecting to auth...");
        navigate('/auth', { replace: true });
        return;
      }

      console.log("👤 User found:", user.email);

      try {
        // Check if profile exists with better error handling
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking profile:", error);
          // Continue anyway, don't block user
        }

        if (!profile) {
          console.log("📝 Creating missing profile for user:", user.email);
          
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            // Don't block user, continue anyway
          } else {
            console.log("✅ Profile created successfully");
          }
        } else {
          console.log("✅ Profile exists:", profile.email);
        }
      } catch (error) {
        console.error("Error in profile check:", error);
        // Don't block user for profile errors
      } finally {
        setProfileChecked(true);
      }
    };

    checkUserProfile();
  }, [user, isLoading, navigate]);

  // Show loading while auth is loading or profile is being checked
  if (isLoading || !profileChecked) {
    console.log("⏳ Auth/Profile loading...");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Verificando autenticación...</p>
          <p className="text-sm text-gray-500 mt-2">Cargando perfil de usuario...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    console.log("❌ No user, not rendering children");
    return null;
  }

  console.log("✅ User authenticated and profile checked, rendering children");
  return <>{children}</>;
};
