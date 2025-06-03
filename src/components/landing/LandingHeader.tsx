
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingHeader = () => {
  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/tarjetavisita-logo.png" 
            alt="TarjetaVisita Logo" 
            className="w-10 h-10 rounded-lg object-contain"
            onError={(e) => {
              console.error('Error loading logo in landing:', e);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log('Landing logo loaded successfully')}
          />
          <h1 className="text-2xl font-bold text-gray-900">TarjetaVisita</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/auth">
            <Button variant="outline">Iniciar sesión</Button>
          </Link>
          <Link to="/auth">
            <Button>Registrarse gratis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
