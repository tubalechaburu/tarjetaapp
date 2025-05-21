
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label = "Volver" }) => {
  return (
    <Link to={to}>
      <Button variant="ghost" className="mb-4 gap-1">
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
};

export default BackButton;
