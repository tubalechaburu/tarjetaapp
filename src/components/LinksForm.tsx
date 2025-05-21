
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Plus } from "lucide-react";
import LinkItem from "./card/LinkItem";
import EmptyLinksMessage from "./card/EmptyLinksMessage";
import { LinkTypeOptions } from "./card/LinkTypeSelector";

interface LinksFormProps {
  links: CardLink[];
  setLinks: (links: CardLink[]) => void;
}

const LinksForm: React.FC<LinksFormProps> = ({ links, setLinks }) => {
  const addLink = () => {
    const newLink: CardLink = {
      id: uuidv4(),
      type: "website",
      url: "",
      title: "Sitio web",
      label: "Sitio web"
    };
    
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const updateLink = (id: string, field: keyof CardLink, value: string) => {
    setLinks(
      links.map(link => {
        if (link.id === id) {
          if (field === "type") {
            // Verificar que el tipo sea válido
            const validType = value as CardLink["type"];
            // Si el tipo cambia, actualizar también la etiqueta
            const typeOption = LinkTypeOptions.find(opt => opt.value === value);
            return {
              ...link,
              [field]: validType,
              label: typeOption?.label || link.label,
              title: typeOption?.label || link.label // Update title when type changes
            };
          }
          // Also update title when label changes if field is "label"
          if (field === "label") {
            return { ...link, [field]: value, title: value };
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
        <LinkItem
          key={link.id}
          link={link}
          index={index}
          onRemove={removeLink}
          onUpdate={updateLink}
        />
      ))}

      {links.length === 0 && <EmptyLinksMessage />}
    </div>
  );
};

export default LinksForm;
