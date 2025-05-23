
import React from "react";
import ColorSelector from "./ColorSelector";

interface ThemeManagerProps {
  selectedColors: string[];
  onColorChange: (index: number, color: string) => void;
  brandColors: { name: string; hex: string }[];
}

const ThemeManager: React.FC<ThemeManagerProps> = ({
  selectedColors,
  onColorChange,
  brandColors,
}) => {
  // Ensure the selectedColors array is properly initialized
  const safeSelectedColors = selectedColors && selectedColors.length === 3 
    ? selectedColors 
    : [brandColors[0].hex, brandColors[1].hex, brandColors[2].hex];
  
  // Define a safe color change handler that enforces the update
  const handleColorChange = (index: number, color: string) => {
    console.log("ThemeManager: Color changed", index, color);
    onColorChange(index, color);
  };
  
  return (
    <ColorSelector
      selectedColors={safeSelectedColors}
      onChange={handleColorChange}
      brandColors={brandColors}
    />
  );
};

export default ThemeManager;
