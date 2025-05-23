
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface LinksHeaderProps {
  onAddLink: () => void;
}

const LinksHeader: React.FC<LinksHeaderProps> = ({ onAddLink }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Enlaces</Label>
        <Button 
          type="button" 
          onClick={onAddLink} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Añadir enlace
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Solo puedes tener un enlace de cada tipo, excepto la opción "Otros" que permite múltiples enlaces.
      </p>
    </div>
  );
};

export default LinksHeader;
