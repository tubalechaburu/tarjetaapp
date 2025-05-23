
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (index: number, color: string) => void;
  brandColors: { name: string; hex: string }[];
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColors,
  onChange,
  brandColors,
}) => {
  // Color purposes
  const colorPurposes = [
    { name: "Fondo", description: "Color de fondo de la tarjeta" },
    { name: "Texto", description: "Color del texto principal" },
    { name: "Resaltar", description: "Color de acentos y elementos destacados" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Label className="text-base font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Colores de la tarjeta
        </Label>
      </div>
      
      {/* Selector individual de colores */}
      <div className="space-y-3">
        {colorPurposes.map((purpose, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: selectedColors[index] || "#ffffff" }}
                />
                <div>
                  <span className="text-sm font-medium">{purpose.name}</span>
                  <p className="text-xs text-gray-500">{purpose.description}</p>
                </div>
              </div>
              <Input
                type="color"
                value={selectedColors[index] || "#ffffff"}
                onChange={(e) => onChange(index, e.target.value)}
                className="w-12 h-8 p-0 border-0 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-sm text-blue-700">
          💡 <strong>Consejo:</strong> Asegúrate de que haya suficiente contraste entre el color de fondo y el texto para una mejor legibilidad.
        </p>
      </div>
    </div>
  );
};

export default ColorSelector;
