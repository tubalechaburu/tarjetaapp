
import React from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BackButton from "@/components/navigation/BackButton";

interface ShareCardHeaderProps {
  error: string | null;
}

const ShareCardHeader: React.FC<ShareCardHeaderProps> = ({ error }) => {
  return (
    <>
      <BackButton to="/" />
      
      {error && (
        <div className="max-w-md mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Tarjeta no encontrada</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="text-muted-foreground text-sm space-y-2 mt-4">
            <p>Posibles razones:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>La tarjeta fue eliminada</li>
              <li>El ID de la tarjeta no es correcto</li>
              <li>La tarjeta no se ha guardado correctamente en la base de datos</li>
              <li>La tarjeta está solo en almacenamiento local de otro dispositivo</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareCardHeader;
