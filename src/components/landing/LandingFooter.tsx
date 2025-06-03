import React from "react";
import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/2d3feecf-3d11-47db-9088-b7ab4ce1bd38.png" 
                alt="TarjetaVisita Logo" 
                className="w-8 h-8 rounded-lg object-contain"
              />
              <h3 className="text-xl font-bold">TarjetaVisita</h3>
            </div>
            <p className="text-gray-400">
              La plataforma líder en tarjetas de presentación digitales
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/create" className="hover:text-white">Crear tarjeta</Link></li>
              <li><Link to="/auth" className="hover:text-white">Registrarse</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="mailto:soporte@tarjetaapp.com" className="hover:text-white">Contacto</a></li>
              <li><a href="#" className="hover:text-white">Ayuda</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Términos</a></li>
              <li><a href="#" className="hover:text-white">Privacidad</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 TarjetaVisita - Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
