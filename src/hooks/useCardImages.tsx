
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
    if (setValue && avatarPreview !== null) {
      console.log("Updating avatarUrl in form:", avatarPreview ? "Avatar present" : "No avatar");
      setValue('avatarUrl', avatarPreview, { shouldDirty: true });
    }
  }, [avatarPreview, setValue]);

  useEffect(() => {
    if (setValue && logoPreview !== null) {
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

  // Log current state for debugging
  useEffect(() => {
    console.log("useCardImages state:", { 
      avatarPreview: avatarPreview ? "Avatar data present" : "No avatar", 
      logoPreview: logoPreview ? "Logo data present" : "No logo",
      initialAvatarUrl: initialData?.avatarUrl ? "Initial avatar present" : "No initial avatar",
      initialLogoUrl: initialData?.logoUrl ? "Initial logo present" : "No initial logo"
    });
  }, [avatarPreview, logoPreview, initialData]);

  return {
    avatarPreview,
    logoPreview,
    setAvatarPreview,
    setLogoPreview,
  };
};
