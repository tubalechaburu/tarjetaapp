
import { useState, useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { BusinessCard } from "@/types";

export const useCardImages = (
  initialData?: BusinessCard,
  setValue?: UseFormSetValue<BusinessCard>
) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatarUrl || null
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logoUrl || null
  );

  // Update form when logos/avatars change
  useEffect(() => {
    if (setValue && avatarPreview) {
      console.log("Updating avatarUrl in form:", avatarPreview ? "Avatar present" : "No avatar");
      setValue('avatarUrl', avatarPreview, { shouldDirty: true });
    }
  }, [avatarPreview, setValue]);

  useEffect(() => {
    if (setValue && logoPreview) {
      console.log("Updating logoUrl in form:", logoPreview ? "Logo present" : "No logo");
      setValue('logoUrl', logoPreview, { shouldDirty: true });
    }
  }, [logoPreview, setValue]);

  // Initialize form with initial data on mount
  useEffect(() => {
    if (initialData && setValue) {
      if (initialData.avatarUrl) {
        console.log("Setting initial avatar:", initialData.avatarUrl ? "Avatar present" : "No avatar");
        setValue('avatarUrl', initialData.avatarUrl, { shouldDirty: true });
        setAvatarPreview(initialData.avatarUrl);
      }
      if (initialData.logoUrl) {
        console.log("Setting initial logo:", initialData.logoUrl ? "Logo present" : "No logo");
        setValue('logoUrl', initialData.logoUrl, { shouldDirty: true });
        setLogoPreview(initialData.logoUrl);
      }
    }
  }, [initialData, setValue]);

  return {
    avatarPreview,
    logoPreview,
    setAvatarPreview,
    setLogoPreview,
  };
};
