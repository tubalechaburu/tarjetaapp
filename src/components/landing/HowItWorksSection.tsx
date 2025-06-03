
import React from "react";

const HowItWorksSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cómo funciona
          </h2>
          <p className="text-lg text-gray-600">
            En solo 3 pasos tendrás tu tarjeta digital lista
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Regístrate gratis</h3>
            <p className="text-gray-600">
              Crea tu cuenta en segundos con tu email
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Completa tu información</h3>
            <p className="text-gray-600">
              Agrega tu foto, datos de contacto y redes sociales
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Comparte tu tarjeta</h3>
            <p className="text-gray-600">
              Usa tu código QR o enlace personalizado para compartir
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
