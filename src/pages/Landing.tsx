
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Share2, Globe, Smartphone, Users, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="TarjetaVisita Logo" 
              className="w-10 h-10 rounded-lg object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900">TarjetaVisita</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="outline">Iniciar sesión</Button>
            </Link>
            <Link to="/auth">
              <Button>Registrarse gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Features Section */}
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

      {/* How it works */}
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo.png" 
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
    </div>
  );
};

export default Landing;
