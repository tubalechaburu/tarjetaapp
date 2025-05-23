
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (index: number, color: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColors,
  onChange,
}) => {
  // Color purposes
  const colorPurposes = [
    { name: "Fondo", description: "Color de fondo de la tarjeta" },
    { name: "Texto", description: "Color del texto principal" },
    { name: "Resaltar", description: "Color de acentos y elementos destacados" }
  ];

  // State to track if color was copied
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleColorChange = (index: number, color: string) => {
    console.log("ColorSelector: Color change", index, color);
    onChange(index, color);
  };

  const copyHexToClipboard = (index: number) => {
    const color = selectedColors[index];
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    toast.success(`Color ${colorPurposes[index].name} copiado: ${color}`);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  console.log("ColorSelector render with colors:", selectedColors);

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
                  style={{ backgroundColor: selectedColors[index] || "#000000" }}
                />
                <div>
                  <span className="text-sm font-medium">{purpose.name}</span>
                  <p className="text-xs text-gray-500">{purpose.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Color picker - moved first for better UX */}
                <Input
                  type="color"
                  value={selectedColors[index] || "#000000"}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-12 h-8 p-0 border-0 cursor-pointer rounded"
                />
                
                {/* HEX input display with copy button */}
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    value={selectedColors[index] || "#000000"}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-28 pr-8 font-mono text-sm"
                    placeholder="#000000"
                  />
                  <button
                    type="button"
                    onClick={() => copyHexToClipboard(index)}
                    className="absolute right-2 text-gray-400 hover:text-gray-600"
                    aria-label="Copiar código de color"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
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
