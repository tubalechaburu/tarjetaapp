
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("🔒 AuthGuard checking auth state...");
    
    if (isLoading) {
      console.log("⏳ Auth is still loading...");
      return;
    }

    if (!user) {
      console.log("❌ No user found, redirecting to auth...");
      navigate('/auth', { replace: true });
      return;
    }

    console.log("✅ User authenticated:", user.email);
    setIsReady(true);
  }, [user, isLoading, navigate]);

  // Show loading while auth is loading
  if (isLoading) {
    console.log("⏳ Auth loading...");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user || !isReady) {
    console.log("❌ No user or not ready, not rendering children");
    return null;
  }

  console.log("✅ User authenticated, rendering children");
  return <>{children}</>;
};
