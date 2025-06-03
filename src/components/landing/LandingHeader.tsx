
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingHeader = () => {
  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/2d3feecf-3d11-47db-9088-b7ab4ce1bd38.png" 
            alt="TarjetaVisita Logo" 
            className="w-10 h-10 rounded-lg object-contain"
            onError={(e) => {
              console.error('Error loading logo in landing header:', e);
              console.log('Trying to load from:', e.currentTarget.src);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Landing header logo loaded successfully from:', '/lovable-uploads/2d3feecf-3d11-47db-9088-b7ab4ce1bd38.png');
            }}
          />
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
