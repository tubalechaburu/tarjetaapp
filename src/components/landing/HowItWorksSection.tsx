
import React from "react";
import { UserPlus, Edit3, Share2 } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Regístrate gratis",
      description: "Crea tu cuenta en segundos con tu email",
      color: "bg-blue-500"
    },
    {
      number: 2,
      icon: Edit3,
      title: "Crea tu tarjeta",
      description: "Agrega tu foto, datos de contacto y redes sociales",
      color: "bg-green-500"
    },
    {
      number: 3,
      icon: Share2,
      title: "Comparte al instante",
      description: "Usa tu código QR o enlace personalizado para compartir",
      color: "bg-purple-500"
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cómo funciona
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En solo 3 pasos tendrás tu tarjeta digital lista para compartir
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="relative text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Línea conectora (excepto en el último) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gray-300 z-0">
                  <div className="absolute right-0 top-0 w-2 h-2 bg-gray-300 rounded-full transform translate-x-1"></div>
                </div>
              )}
              
              <div className="relative z-10">
                <div className={`w-16 h-16 ${step.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <step.icon className="h-8 w-8" />
                </div>
                
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 shadow-sm">
                  {step.number}
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Indicador de tiempo */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Tiempo total: menos de 5 minutos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
