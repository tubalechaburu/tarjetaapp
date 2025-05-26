
import { useState, useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { BusinessCard } from "@/types";

export const useCardVisibility = (
  initialData?: BusinessCard,
  setValue?: UseFormSetValue<BusinessCard>
) => {
  // Field visibility state - initialize with data from initialData if available
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(() => {
    if (initialData?.visibleFields) {
      console.log("🔧 Initializing visibility with existing data:", initialData.visibleFields);
      return initialData.visibleFields;
    }
    // Default values when no initial data
    return {
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
    };
  });

  // Update form whenever visibility changes
  useEffect(() => {
    if (setValue) {
      console.log("🔧 Updating form visibility fields:", visibleFields);
      setValue('visibleFields', visibleFields, { shouldDirty: true, shouldTouch: true });
    }
  }, [visibleFields, setValue]);

  // Initialize form with visibility data when component mounts
  useEffect(() => {
    if (initialData?.visibleFields && setValue) {
      console.log("🚀 Setting initial visibility in form:", initialData.visibleFields);
      setValue('visibleFields', initialData.visibleFields, { shouldDirty: false });
    }
  }, [initialData, setValue]);

  const handleFieldVisibilityChange = (fieldName: string, isVisible: boolean) => {
    console.log(`🔧 Changing ${fieldName} visibility to:`, isVisible);
    const updatedVisibility = { ...visibleFields, [fieldName]: isVisible };
    setVisibleFields(updatedVisibility);
    
    // Force immediate form update
    if (setValue) {
      console.log(`🚀 Immediately updating form field ${fieldName} to:`, isVisible);
      setValue('visibleFields', updatedVisibility, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
  };

  return {
    visibleFields,
    handleFieldVisibilityChange,
  };
};
