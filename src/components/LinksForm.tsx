
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash, Link2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LinksFormProps {
  links: CardLink[];
  setLinks: (links: CardLink[]) => void;
}

const LinkTypeOptions = [
  { value: "website", label: "Sitio web" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "calendar", label: "Calendario" },
  { value: "other", label: "Otro" }
];

const LinksForm: React.FC<LinksFormProps> = ({ links, setLinks }) => {
  const addLink = () => {
    setLinks([
      ...links,
      {
        id: uuidv4(),
        type: "website",
        url: "",
        label: "Sitio web"
      }
    ]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const updateLink = (id: string, field: keyof CardLink, value: string) => {
    setLinks(
      links.map(link => {
        if (link.id === id) {
          if (field === "type") {
            // Si el tipo cambia, actualizar también la etiqueta
            const typeOption = LinkTypeOptions.find(opt => opt.value === value);
            return {
              ...link,
              [field]: value,
              label: typeOption?.label || link.label
            };
          }
          return { ...link, [field]: value };
        }
        return link;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Enlaces</Label>
        <Button 
          type="button" 
          onClick={addLink} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Añadir enlace
        </Button>
      </div>

      {links.map((link, index) => (
        <div key={link.id} className="border p-3 rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              Enlace {index + 1}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLink(link.id)}
              className="h-6 w-6"
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor={`link-type-${link.id}`}>Tipo</Label>
              <Select
                value={link.type}
                onValueChange={(value) => updateLink(link.id, "type", value)}
              >
                <SelectTrigger id={`link-type-${link.id}`}>
                  <SelectValue placeholder="Tipo de enlace" />
                </SelectTrigger>
                <SelectContent>
                  {LinkTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {link.type === "other" && (
              <div>
                <Label htmlFor={`link-label-${link.id}`}>Etiqueta</Label>
                <Input
                  id={`link-label-${link.id}`}
                  value={link.label || ""}
                  onChange={(e) => updateLink(link.id, "label", e.target.value)}
                  placeholder="Nombre del enlace"
                />
              </div>
            )}

            <div>
              <Label htmlFor={`link-url-${link.id}`}>URL</Label>
              <Input
                id={`link-url-${link.id}`}
                value={link.url}
                onChange={(e) => updateLink(link.id, "url", e.target.value)}
                placeholder={link.type === "whatsapp" ? "Número de teléfono con prefijo" : "https://..."}
              />
            </div>
          </div>
        </div>
      ))}

      {links.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No has añadido ningún enlace. Haz clic en "Añadir enlace" para empezar.
        </div>
      )}
    </div>
  );
};

export default LinksForm;
