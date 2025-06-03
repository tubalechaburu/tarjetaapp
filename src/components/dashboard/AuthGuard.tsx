
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    console.log("🔒 AuthGuard - user:", !!user, "isLoading:", isLoading);
    
    if (isLoading) {
      console.log("⏳ Still loading auth...");
      setShouldRender(false);
      return;
    }

    if (!user) {
      console.log("❌ No user, redirecting to auth");
      navigate('/auth', { replace: true });
      setShouldRender(false);
      return;
    }

    console.log("✅ User found, allowing access");
    setShouldRender(true);
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user || !shouldRender) {
    return null;
  }

  return <>{children}</>;
};
