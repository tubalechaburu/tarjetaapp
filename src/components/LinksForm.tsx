
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
    // Find an available link type
    const usedTypes = links.map(link => link.type);
    
    // Find first available type that's not 'other' (since 'other' can have multiple)
    const availableType = LinkTypeOptions.find(option => 
      option.value === 'other' || !usedTypes.includes(option.value)
    );
    
    // Default to 'other' if all specific types are used
    const newType: CardLink["type"] = availableType ? availableType.value : 'other';
    const typeLabel = LinkTypeOptions.find(opt => opt.value === newType)?.label || 'Otro enlace';
    
    const newLink: CardLink = {
      id: uuidv4(),
      type: newType,
      url: "",
      title: typeLabel,
      label: typeLabel
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
            // Allow changing to any type if it's not already used or if it's 'other'
            const validType = value as CardLink["type"];
            const isTypeUsed = links.some(l => l.id !== id && l.type === validType);
            
            // If the type is already used and it's not 'other', prevent the change
            if (isTypeUsed && validType !== 'other') {
              toast.error(`Ya existe un enlace de tipo ${validType}`);
              return link;
            }
            
            // Type change is valid, update label and title too
            const typeOption = LinkTypeOptions.find(opt => opt.value === value);
            return {
              ...link,
              [field]: validType,
              label: typeOption?.label || link.label,
              title: typeOption?.label || link.title
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
