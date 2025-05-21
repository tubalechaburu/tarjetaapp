
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardLink } from "@/types";
import { Link2, Trash } from "lucide-react";
import LinkTypeSelector from "./LinkTypeSelector";
import { LinkTypeOptions } from "./LinkTypeSelector";

interface LinkItemProps {
  link: CardLink;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof CardLink, value: string) => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ link, index, onRemove, onUpdate }) => {
  const handleTypeChange = (value: string) => {
    onUpdate(link.id, "type", value);
  };

  return (
    <div className="border p-3 rounded-md space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium flex items-center gap-1">
          <Link2 className="h-4 w-4" />
          Enlace {index + 1}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(link.id)}
          className="h-6 w-6"
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <LinkTypeSelector
          id={`link-type-${link.id}`}
          value={link.type}
          onValueChange={handleTypeChange}
        />

        {link.type === "other" && (
          <div>
            <Label htmlFor={`link-label-${link.id}`}>Etiqueta</Label>
            <Input
              id={`link-label-${link.id}`}
              value={link.label || ""}
              onChange={(e) => onUpdate(link.id, "label", e.target.value)}
              placeholder="Nombre del enlace"
            />
          </div>
        )}

        <div>
          <Label htmlFor={`link-url-${link.id}`}>URL</Label>
          <Input
            id={`link-url-${link.id}`}
            value={link.url}
            onChange={(e) => onUpdate(link.id, "url", e.target.value)}
            placeholder={link.type === "whatsapp" ? "Número de teléfono con prefijo" : "https://..."}
          />
        </div>
      </div>
    </div>
  );
};

export default LinkItem;
