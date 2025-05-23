
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye } from "lucide-react";

interface FieldVisibilityProps {
  visibleFields: Record<string, boolean>;
  onChange: (fieldName: string, isVisible: boolean) => void;
}

const FieldVisibility: React.FC<FieldVisibilityProps> = ({ visibleFields, onChange }) => {
  const fields = [
    { id: "name", name: "Nombre", default: true },
    { id: "jobTitle", name: "Puesto", default: true },
    { id: "company", name: "Empresa", default: true },
    { id: "description", name: "Descripción", default: true },
    { id: "email", name: "Email", default: true },
    { id: "phone", name: "Teléfono", default: true },
    { id: "website", name: "Sitio web", default: true },
    { id: "address", name: "Dirección", default: true }
  ];

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2 text-blue-700">
          <Eye className="h-4 w-4" />
          Visibilidad de campos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-700 mb-3">
          Elige qué información quieres mostrar en tu tarjeta digital
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between space-x-2">
              <Label htmlFor={`visibility-${field.id}`} className="cursor-pointer">
                {field.name}
              </Label>
              <Switch
                id={`visibility-${field.id}`}
                checked={visibleFields[field.id] ?? field.default}
                onCheckedChange={(checked) => onChange(field.id, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldVisibility;
