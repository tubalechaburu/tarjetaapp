
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
    if (!isLoading && !user) {
      console.log("❌ No user found, redirecting to auth...");
      navigate('/auth', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Don't render anything if redirecting
  if (!isLoading && !user) {
    return null;
  }

  // Show loading only if auth is loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-lg">Cargando...</p>
          <p className="text-sm text-gray-500 mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
