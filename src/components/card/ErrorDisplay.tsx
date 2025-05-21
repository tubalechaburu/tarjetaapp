
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ErrorDisplay: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center">
      <Link to="/">
        <Button variant="ghost" className="mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Button>
      </Link>
      
      <h2 className="text-xl font-semibold mb-4">Tarjeta no encontrada</h2>
      <p className="mb-6">La tarjeta que estás buscando no existe o ha sido eliminada.</p>
      
      <Link to="/">
        <Button>Ir a la página principal</Button>
      </Link>
    </div>
  );
};

export default ErrorDisplay;
