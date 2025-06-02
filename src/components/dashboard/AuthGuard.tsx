
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔒 AuthGuard state:", { user: user?.email, isLoading });
    
    if (!isLoading && !user) {
      console.log("❌ No user found, redirecting to auth...");
      navigate('/auth', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show loading while auth is loading
  if (isLoading) {
    console.log("⏳ Auth is loading...");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-lg">Cargando...</p>
          <p className="text-sm text-gray-500 mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    console.log("❌ No user, not rendering children");
    return null;
  }

  console.log("✅ User authenticated, rendering children");
  return <>{children}</>;
};
