
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw } from "lucide-react";

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (index: number, color: string) => void;
  brandColors: { name: string; hex: string }[];
}

// Paletas de colores predefinidas
const COLOR_PALETTES = [
  {
    name: "Corporativo",
    colors: ["#1e40af", "#ffffff", "#f59e0b"]
  },
  {
    name: "Elegante",
    colors: ["#000000", "#ffffff", "#dd8d0a"]
  },
  {
    name: "Moderno",
    colors: ["#6366f1", "#ffffff", "#ec4899"]
  },
  {
    name: "Natural",
    colors: ["#059669", "#ffffff", "#f59e0b"]
  },
  {
    name: "Minimalista",
    colors: ["#f8fafc", "#1f2937", "#3b82f6"]
  }
];

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

  const applyPalette = (palette: string[]) => {
    palette.forEach((color, index) => {
      onChange(index, color);
    });
  };

  const resetToDefault = () => {
    onChange(0, brandColors[0].hex); // Dorado
    onChange(1, brandColors[2].hex); // Negro
    onChange(2, brandColors[0].hex); // Dorado
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Colores de la tarjeta
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetToDefault}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Restablecer
        </Button>
      </div>

      {/* Paletas predefinidas */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Paletas predefinidas</Label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_PALETTES.map((palette, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              className="h-auto p-2 flex flex-col items-center gap-1"
              onClick={() => applyPalette(palette.colors)}
            >
              <div className="flex gap-1">
                {palette.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs">{palette.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Selector individual de colores */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Personalizar colores</Label>
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
            
            {/* Colores de marca para este propósito */}
            <div className="flex flex-wrap gap-1 ml-8">
              {brandColors.map((color) => (
                <button
                  key={`${index}-${color.hex}`}
                  type="button"
                  className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onChange(index, color.hex)}
                  title={`${color.name} para ${purpose.name}`}
                />
              ))}
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
