
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
    // Verificar si ya existe un enlace de tipo "website"
    const existingWebsite = links.find(link => link.type === "website");
    if (existingWebsite) {
      toast.error("Ya existe un enlace de tipo 'Sitio web'. Solo puedes tener uno de cada tipo excepto 'Otros'.");
      return;
    }

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
            
            // Verificar si ya existe un enlace de este tipo (excepto "other")
            if (validType !== "other") {
              const existingLink = links.find(l => l.type === validType && l.id !== id);
              if (existingLink) {
                toast.error(`Ya existe un enlace de tipo '${LinkTypeOptions.find(opt => opt.value === validType)?.label}'. Solo puedes tener uno de cada tipo excepto 'Otros'.`);
                return link; // No cambiar el tipo si ya existe
              }
            }
            
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
