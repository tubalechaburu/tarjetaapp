
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="space-y-2">
      <Label>Colores de la tarjeta (máximo 3)</Label>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: selectedColors[index] || "#ffffff" }}
              />
              <Input
                type="color"
                value={selectedColors[index] || "#ffffff"}
                onChange={(e) => onChange(index, e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {brandColors.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onChange(index, color.hex)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Selecciona hasta 3 colores para personalizar tu tarjeta
      </p>
    </div>
  );
};

export default ColorSelector;
