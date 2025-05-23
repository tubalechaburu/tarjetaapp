
import { useState, useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { BusinessCard } from "@/types";

// Default theme colors - black, white, and orange
const DEFAULT_COLORS = ["#000000", "#ffffff", "#dd8d0a"];

export const useCardColors = (
  initialData?: BusinessCard,
  setValue?: UseFormSetValue<BusinessCard>
) => {
  // Initialize with existing colors if available, with a proper fallback
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    if (initialData?.themeColors && initialData.themeColors.length === 3) {
      console.log("Using initial colors:", initialData.themeColors);
      return [...initialData.themeColors];
    }
    console.log("Using default colors:", DEFAULT_COLORS);
    return [...DEFAULT_COLORS];
  });

  // Update form values when selectedColors change - critical for saving
  useEffect(() => {
    if (setValue) {
      console.log("CardColors: Setting form colors to", selectedColors);
      setValue('themeColors', selectedColors, { shouldDirty: true });
    }
  }, [selectedColors, setValue]);

  const handleColorChange = (index: number, color: string) => {
    console.log("CardColors: Color change requested", index, color);
    const newColors = [...selectedColors];
    newColors[index] = color;
    console.log("CardColors: New colors array", newColors);
    setSelectedColors(newColors);
  };

  return {
    selectedColors,
    handleColorChange,
    DEFAULT_COLORS,
  };
};
