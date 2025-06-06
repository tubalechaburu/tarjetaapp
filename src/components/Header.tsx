
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Shield, LogOut } from "lucide-react";

const Header = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Determine logo destination based on auth status
  const logoDestination = user ? "/dashboard" : "/landing";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to={logoDestination} className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/17402972-39f6-46e1-99a9-29b842645e67.png" 
              alt="TarjetaVisita Logo" 
              onError={e => {
                console.error('Error loading logo in header:', e);
                console.log('Trying to load from:', e.currentTarget.src);
                e.currentTarget.style.display = 'none';
              }} 
              onLoad={() => console.log('Header logo loaded successfully from:', '/lovable-uploads/17402972-39f6-46e1-99a9-29b842645e67.png')} 
              className="w-40 h-40 object-contain" 
            />
          </Link>

          {/* Navigation for authenticated users */}
          {user && (
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <User className="h-4 w-4" />
                    Perfil
                  </Button>
                </Link>

                {userRole === 'superadmin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
              </nav>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1">
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
