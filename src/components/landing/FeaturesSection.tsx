
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Globe, Zap, Shield, Smartphone, Palette } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: QrCode,
      title: "Códigos QR únicos",
      description: "Genera códigos QR personalizados que permiten compartir tu información al instante. Solo escanear y listo.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Globe,
      title: "Acceso desde cualquier lugar",
      description: "Tu tarjeta digital está siempre disponible online. Compártela por WhatsApp, email o redes sociales.",
      color: "text-green-600", 
      bgColor: "bg-green-50"
    },
    {
      icon: Zap,
      title: "Fácil y rápido",
      description: "Crea tu tarjeta en menos de 5 minutos. Diseño profesional y colores personalizables.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: "Seguro y privado",
      description: "Tus datos están protegidos con la mejor tecnología de seguridad. Tu privacidad es nuestra prioridad.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Smartphone,
      title: "Optimizado para móviles",
      description: "Tu tarjeta se ve perfecta en cualquier dispositivo. Diseño responsive y rápido de cargar.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Palette,
      title: "Personalización total",
      description: "Elige colores, fuentes y estilos que representen tu marca personal o empresa.",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          ¿Por qué elegir TarjetaApp?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          La forma más moderna y efectiva de compartir tu información profesional
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card 
            key={feature.title}
            className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md"
          >
            <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <CardHeader className="relative z-10 text-center pb-4">
              <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {feature.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0">
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
