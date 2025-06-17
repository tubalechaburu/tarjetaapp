
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 lg:py-24">
      <div className="text-center max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
          🚀 La revolución digital de las tarjetas de presentación
        </Badge>
        
        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Crea y comparte tarjetas de 
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {" "}visita digitales
          </span>
          <br />al instante
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Olvídate del papel. Comparte tu información profesional con códigos QR, 
          enlaces personalizados y un diseño que destaca tu marca personal.
        </p>

        {/* Beneficios rápidos */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-gray-700">
          <div className="flex items-center gap-2 group transition-transform hover:scale-105">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Gratis para siempre</span>
          </div>
          <div className="flex items-center gap-2 group transition-transform hover:scale-105">
            <Zap className="h-5 w-5 text-blue-500" />
            <span>Listo en 2 minutos</span>
          </div>
          <div className="flex items-center gap-2 group transition-transform hover:scale-105">
            <Users className="h-5 w-5 text-purple-500" />
            <span>Comparte sin límites</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/auth">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Comienza gratis
            </Button>
          </Link>
          <Link to="/demo">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 border-2 hover:bg-gray-50 transition-colors"
            >
              Ver demo
            </Button>
          </Link>
        </div>

        {/* Imagen de ejemplo mejorada */}
        <div className="max-w-sm mx-auto">
          <div className="relative group">
            <img
              src="/lovable-uploads/2cd34382-1627-440f-b873-9731b1a81f44.png"
              alt="Ejemplo de tarjeta digital - María González"
              className="w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Ejemplo de tarjeta digital profesional</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
