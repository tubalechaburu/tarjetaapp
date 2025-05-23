
import React from "react";
import ColorSelector from "./ColorSelector";

interface ThemeManagerProps {
  selectedColors: string[];
  onColorChange: (index: number, color: string) => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({
  selectedColors,
  onColorChange,
}) => {
  // Ensure the selectedColors array is properly initialized with defaults if needed
  const safeSelectedColors = selectedColors && selectedColors.length === 3 
    ? selectedColors 
    : ["#ff00ff", "#000000", "#00ff00"]; // Default magenta, black, green
  
  // Define a safe color change handler that ensures the update
  const handleColorChange = (index: number, color: string) => {
    console.log("ThemeManager: Color changed", index, color);
    onColorChange(index, color);
  };
  
  return (
    <ColorSelector
      selectedColors={safeSelectedColors}
      onChange={handleColorChange}
    />
  );
};

export default ThemeManager;
