
import { Link, Navigate } from "react-router-dom";
import CardForm from "@/components/CardForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateCard = () => {
  const { user, isLoading } = useAuth();

  // Si está cargando, no hacemos nada aún
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a la página de autenticación
  if (!user) {
    return <Navigate to="/auth" state={{ redirectTo: "/create" }} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/">
        <Button variant="ghost" className="mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Crear Nueva Tarjeta</h1>
        <CardForm />
      </div>
    </div>
  );
};

export default CreateCard;
