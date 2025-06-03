
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          ¿Listo para crear tu tarjeta digital?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Únete a miles de profesionales que ya usan TarjetaApp para hacer networking de forma inteligente
        </p>
        <Link to="/auth">
          <Button size="lg" className="text-lg px-8 py-4">
            Comenzar ahora - Es gratis
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
