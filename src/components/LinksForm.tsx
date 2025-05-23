
import React from "react";
import { CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import LinksHeader from "./card/LinksHeader";
import LinksList from "./card/LinksList";
import { LinkTypeOptions } from "./card/LinkTypeSelector";
import { toast } from "sonner";

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
      <LinksHeader onAddLink={addLink} />
      <LinksList 
        links={links} 
        onRemove={removeLink} 
        onUpdate={updateLink} 
      />
    </div>
  );
};

export default LinksForm;
