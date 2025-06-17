
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/17402972-39f6-46e1-99a9-29b842645e67.png" 
              alt="TarjetaVisita Logo" 
              onError={(e) => {
                console.error('Error loading logo in landing header:', e);
                console.log('Trying to load from:', e.currentTarget.src);
                e.currentTarget.style.display = 'none';
              }} 
              onLoad={() => {
                console.log('Landing header logo loaded successfully from:', '/lovable-uploads/17402972-39f6-46e1-99a9-29b842645e67.png');
              }} 
              className="w-40 h-40 object-contain hover:scale-105 transition-transform duration-300" 
            />
          </div>
          
          <div className="flex gap-3">
            <Link to="/auth">
              <Button 
                variant="ghost" 
                className="hover:bg-gray-100 transition-colors"
              >
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                Registrarse gratis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
