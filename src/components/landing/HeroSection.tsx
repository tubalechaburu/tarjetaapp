
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <Badge variant="secondary" className="mb-4">
        🚀 La revolución digital de las tarjetas de presentación
      </Badge>
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Crea tu tarjeta de
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {" "}presentación digital
        </span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
        Olvídate del papel. Comparte tu información profesional al instante con códigos QR, 
        enlaces personalizados y un diseño que destaca tu marca personal.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Link to="/auth">
          <Button size="lg" className="text-lg px-8 py-4">
            Crear mi tarjeta gratis
          </Button>
        </Link>
      </div>

      {/* Imagen de ejemplo de la tarjeta */}
      <div className="max-w-sm mx-auto">
        <img
          src="/lovable-uploads/80bd2469-a8e8-4a1b-8741-7d640baf9ae8.png"
          alt="Ejemplo de tarjeta digital - María González"
          className="w-full rounded-lg shadow-2xl"
        />
      </div>
    </section>
  );
};

export default HeroSection;
