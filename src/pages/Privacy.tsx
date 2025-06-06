
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
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
            Política de Privacidad
          </h1>
          
          <p className="text-sm text-gray-600 mb-6">
            Fecha de entrada en vigor: 06/06/2025
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="mb-6">
              Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tus datos personales al usar TarjetApp.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">1. Responsable del tratamiento</h2>
            <p className="mb-4">
              El responsable de tus datos personales es Tubal Echaburu Mancisidor, con correo de contacto: tubal@tubalechaburu.com.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Datos de registro: nombre, email y contraseña cifrada.</li>
              <li>Datos de personalización de tarjetas.</li>
              <li>Datos de uso y actividad (cookies, logs).</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Finalidades</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Gestionar tu cuenta y permitirte usar la aplicación.</li>
              <li>Mejorar el servicio y corregir errores.</li>
              <li>Comunicarnos contigo en caso necesario.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Legitimación</h2>
            <p className="mb-4">
              El tratamiento se basa en tu consentimiento al registrarte y en la necesidad de ejecutar el servicio.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Destinatarios</h2>
            <p className="mb-4">
              Tus datos no se cederán a terceros salvo obligación legal o proveedores tecnológicos bajo acuerdo de confidencialidad.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Conservación</h2>
            <p className="mb-4">
              Tus datos se conservarán mientras tengas una cuenta activa. Puedes solicitar su eliminación cuando quieras.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Derechos</h2>
            <p className="mb-4">
              Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y portabilidad escribiendo a: tubal@tubalechaburu.com.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Seguridad</h2>
            <p className="mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Cambios</h2>
            <p className="mb-4">
              Podremos actualizar esta política. Si los cambios son relevantes, te lo notificaremos.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
