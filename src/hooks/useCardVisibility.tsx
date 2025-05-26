
import { useState, useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { BusinessCard } from "@/types";

export const useCardVisibility = (
  initialData?: BusinessCard,
  setValue?: UseFormSetValue<BusinessCard>
) => {
  // Field visibility state
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    initialData?.visibleFields || {
      name: true,
      jobTitle: true,
      company: true,
      email: true,
      phone: true,
      website: true,
      address: true,
      description: true,
      avatarUrl: true,
      logoUrl: true,
    }
  );

  // Initialize form with visibility data
  useEffect(() => {
    if (initialData && setValue) {
      console.log("Initializing visibility with data:", initialData);
      setValue('visibleFields', visibleFields, { shouldDirty: true });
    }
  }, [initialData, setValue, visibleFields]);

  const handleFieldVisibilityChange = (fieldName: string, isVisible: boolean) => {
    const updatedVisibility = { ...visibleFields, [fieldName]: isVisible };
    setVisibleFields(updatedVisibility);
    if (setValue) {
      setValue('visibleFields', updatedVisibility, { shouldDirty: true });
    }
  };

  return {
    visibleFields,
    handleFieldVisibilityChange,
  };
};
