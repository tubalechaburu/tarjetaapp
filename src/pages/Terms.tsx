
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/auth">
          <Button variant="ghost" className="mb-6 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Términos y Condiciones de Uso
          </h1>
          
          <p className="text-sm text-gray-600 mb-6">
            Fecha de entrada en vigor: 06/06/2025
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="mb-6">
              Estos Términos y Condiciones regulan el acceso y uso de la aplicación TarjetaVisita.App, 
              una herramienta para crear tarjetas digitales personalizadas, ofrecida por Tubal Echaburu Mancisidor.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Aceptación de los términos</h2>
            <p className="mb-4">
              Al registrarte o utilizar TarjetaVisita.App, aceptas estos términos de forma plena y sin reservas. 
              Si no estás de acuerdo, no utilices la aplicación.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Descripción del servicio</h2>
            <p className="mb-4">
              TarjetaVisita.App permite crear, editar y compartir tarjetas de visita digitales personalizadas, 
              incluyendo datos de contacto, enlaces sociales, QR y otros elementos.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Registro y cuenta</h2>
            <p className="mb-4">
              Para acceder a ciertas funcionalidades, debes crear una cuenta proporcionando información veraz y actualizada. 
              Eres responsable de mantener la confidencialidad de tus credenciales.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Uso aceptable</h2>
            <p className="mb-4">
              No está permitido usar TarjetaVisita.App para actividades ilegales, difamatorias, fraudulentas o que 
              infrinjan derechos de terceros. El Proveedor se reserva el derecho de suspender cuentas por usos indebidos.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Propiedad intelectual</h2>
            <p className="mb-4">
              Todos los derechos sobre la plataforma, diseño, logos y funcionalidades pertenecen al Proveedor. 
              El contenido que subas o personalices seguirá siendo de tu propiedad, pero concedes al Proveedor una 
              licencia para mostrarlo y gestionarlo en la aplicación.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Cancelación y eliminación de cuenta</h2>
            <p className="mb-4">
              Puedes solicitar la eliminación de tu cuenta en cualquier momento. El Proveedor podrá suspender o 
              cancelar cuentas que incumplan estos términos.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Exclusión de garantías</h2>
            <p className="mb-4">
              La plataforma se ofrece "tal cual". El Proveedor no garantiza que el servicio estará libre de errores o interrupciones.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitación de responsabilidad</h2>
            <p className="mb-4">
              El Proveedor no será responsable de daños directos o indirectos derivados del uso de TarjetaVisita.App, 
              salvo en caso de dolo o negligencia grave.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Modificaciones</h2>
            <p className="mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Se notificarán los cambios 
              en la plataforma o por email.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">10. Condiciones de uso adicionales</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Está prohibido automatizar accesos o extraer datos sin autorización.</li>
              <li>No puedes suplantar a otros usuarios o utilizar la app para enviar spam.</li>
              <li>Nos reservamos el derecho a suspender temporalmente la plataforma por mantenimiento o razones técnicas.</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
