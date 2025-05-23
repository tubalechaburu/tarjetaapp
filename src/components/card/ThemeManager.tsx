
import React from "react";
import ColorSelector from "./ColorSelector";

// Default brand colors - using the black, white and orange from the screenshot
const DEFAULT_COLORS = ["#000000", "#ffffff", "#dd8d0a"];

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
    : [...DEFAULT_COLORS]; // Use the black, white, orange defaults
  
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
