
import { Link } from "react-router-dom";
import CardForm from "@/components/CardForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreateCard = () => {
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
