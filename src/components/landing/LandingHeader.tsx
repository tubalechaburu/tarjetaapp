import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingHeader = () => {
  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/17402972-39f6-46e1-99a9-29b842645e67.png" 
            alt="TarjetaVisita Logo" 
            className="w-15 h-15 object-contain"
            onError={(e) => {
              console.error('Error loading logo in landing header:', e);
              console.log('Trying to load from:', e.currentTarget.src);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Landing header logo loaded successfully from:', '/lovable-uploads/17402972-39f6-46e1-99a9-29b842645e67.png');
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
