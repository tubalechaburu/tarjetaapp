
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface LinkTypeOption {
  value: string;
  label: string;
}

export const LinkTypeOptions: LinkTypeOption[] = [
  { value: "website", label: "Sitio web" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "calendar", label: "Calendario" },
  { value: "other", label: "Otro" }
];

interface LinkTypeSelectorProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
}

const LinkTypeSelector: React.FC<LinkTypeSelectorProps> = ({ id, value, onValueChange }) => {
  return (
    <div>
      <Label htmlFor={id}>Tipo</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
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
  );
};

export default LinkTypeSelector;
