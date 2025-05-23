
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BusinessCard } from "@/types";

interface ExistingCardWarningProps {
  existingCards: BusinessCard[];
}

const ExistingCardWarning: React.FC<ExistingCardWarningProps> = ({ existingCards }) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Ya tienes una tarjeta</h2>
      <p className="mb-6">Solo puedes tener una tarjeta digital. Puedes editar la existente.</p>
      <Button onClick={() => navigate(`/edit/${existingCards[0].id}`)}>
        Editar mi tarjeta
      </Button>
    </div>
  );
};

export default ExistingCardWarning;
