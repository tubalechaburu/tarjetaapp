
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Globe, Zap } from "lucide-react";

const FeaturesSection = () => {
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

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Códigos QR únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Genera códigos QR personalizados que permiten compartir tu información 
              al instante. Solo escanear y listo.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Acceso desde cualquier lugar</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Tu tarjeta digital está siempre disponible online. Compártela por 
              WhatsApp, email o redes sociales.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-xl">Fácil y rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Crea tu tarjeta en menos de 5 minutos. Diseño profesional, 
              colores personalizables y enlaces a tus redes sociales.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FeaturesSection;
