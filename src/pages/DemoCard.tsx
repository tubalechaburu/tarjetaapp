
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Globe, Linkedin, Twitter, Instagram } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";

const DemoCard = () => {
  const demoData = {
    name: "María González",
    title: "Directora de Marketing Digital",
    company: "TechStart Solutions",
    email: "maria.gonzalez@techstart.com",
    phone: "+34 655 123 456",
    address: "Madrid, España",
    description: "Especialista en estrategias digitales y crecimiento empresarial. Ayudo a empresas a potenciar su presencia online y aumentar sus ventas.",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    links: [
      { type: "website", url: "https://mariagonzalez.com", label: "Sitio web" },
      { type: "linkedin", url: "https://linkedin.com/in/mariagonzalez", label: "LinkedIn" },
      { type: "twitter", url: "https://twitter.com/mariagonzalez", label: "Twitter" },
      { type: "instagram", url: "https://instagram.com/mariagonzalez", label: "Instagram" }
    ],
    theme: {
      background: "#1e40af",
      text: "#ffffff",
      accent: "#3b82f6"
    }
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case "website": return <Globe className="w-4 h-4" />;
      case "linkedin": return <Linkedin className="w-4 h-4" />;
      case "twitter": return <Twitter className="w-4 h-4" />;
      case "instagram": return <Instagram className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <Link to="/landing">
            <Button variant="outline" className="mb-4">
              ← Volver a la landing
            </Button>
          </Link>
          <Badge variant="secondary" className="mb-2">
            📱 Ejemplo de tarjeta digital
          </Badge>
        </div>

        {/* Tarjeta de ejemplo */}
        <Card 
          className="overflow-hidden shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${demoData.theme.background} 0%, ${demoData.theme.accent} 100%)`,
            color: demoData.theme.text
          }}
        >
          <CardContent className="p-8 text-center">
            {/* Foto de perfil */}
            <div className="mb-6">
              <img
                src={demoData.photo}
                alt={demoData.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white/20"
              />
            </div>

            {/* Información básica */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{demoData.name}</h1>
              <p className="text-lg opacity-90 mb-1">{demoData.title}</p>
              <p className="text-base opacity-80">{demoData.company}</p>
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <p className="text-sm opacity-90 leading-relaxed">
                {demoData.description}
              </p>
            </div>

            {/* Información de contacto */}
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 opacity-80" />
                <span className="text-sm">{demoData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 opacity-80" />
                <span className="text-sm">{demoData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 opacity-80" />
                <span className="text-sm">{demoData.address}</span>
              </div>
            </div>

            {/* Enlaces sociales */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 opacity-90">Sígueme en:</h3>
              <div className="grid grid-cols-2 gap-2">
                {demoData.links.map((link, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    {getLinkIcon(link.type)}
                    <span className="ml-2">{link.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Código QR */}
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 opacity-90">Escanea para compartir</h3>
              <div className="bg-white p-3 rounded-lg inline-block">
                <QRCodeSVG
                  value="https://tarjetavisita.app/card/demo"
                  size={120}
                  level="M"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to action */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Te gusta este diseño?
          </h3>
          <p className="text-gray-600 mb-4">
            Crea tu propia tarjeta digital en menos de 5 minutos
          </p>
          <Link to="/auth">
            <Button size="lg" className="w-full">
              Crear mi tarjeta gratis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoCard;
