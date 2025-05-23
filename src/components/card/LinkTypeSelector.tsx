
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LinkTypeOptions = [
  { value: "website", label: "Sitio web" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "calendar", label: "Reservar cita" }, // Changed from "Calendario" to "Reservar cita"
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Otro enlace" },
];

interface LinkTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const LinkTypeSelector: React.FC<LinkTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Tipo de enlace" />
      </SelectTrigger>
      <SelectContent>
        {LinkTypeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LinkTypeSelector;
