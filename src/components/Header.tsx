
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Settings, Shield, LogOut } from "lucide-react";

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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/tarjetavisita-logo.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-lg object-contain"
              onError={(e) => {
                console.error('Error loading logo:', e);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => console.log('Logo loaded successfully')}
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
                
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    Configuración
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </div>
            </div>
          )}

          {/* Navigation for non-authenticated users */}
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
