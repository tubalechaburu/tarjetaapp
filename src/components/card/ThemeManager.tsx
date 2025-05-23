
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
  return (
    <ColorSelector
      selectedColors={selectedColors}
      onChange={onColorChange}
      brandColors={brandColors}
    />
  );
};

export default ThemeManager;
