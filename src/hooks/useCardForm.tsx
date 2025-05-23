import { useState } from "react";
import { useForm } from "react-hook-form";
import { BusinessCard, CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveCard } from "@/utils/storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCardValidation } from "./useCardValidation";
import { useCardColors } from "./useCardColors";
import { useCardImages } from "./useCardImages";
import { useCardVisibility } from "./useCardVisibility";

export const useCardForm = (initialData?: BusinessCard) => {
  const navigate = useNavigate();
  const [links, setLinks] = useState<CardLink[]>(initialData?.links || []);
  
  // Use the separated hooks
  const validation = useCardValidation(initialData);
  const colors = useCardColors(initialData);
  const images = useCardImages(initialData);
  const visibility = useCardVisibility(initialData);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<BusinessCard>({
    defaultValues: initialData || {
      id: uuidv4(),
      name: "",
      jobTitle: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      avatarUrl: "",
      logoUrl: "",
      description: "",
      createdAt: Date.now(),
      themeColors: [...colors.DEFAULT_COLORS],
      visibleFields: {
        name: true,
        jobTitle: true,
        company: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        description: true,
      }
    }
  });

  // Connect the hooks to the form
  const connectedColors = useCardColors(initialData, setValue);
  const connectedImages = useCardImages(initialData, setValue);
  const connectedVisibility = useCardVisibility(initialData, setValue);

  const onSubmit = async (data: BusinessCard) => {
    try {
      // Check if user already has a card and is not superadmin
      if (!initialData && validation.existingCards.length > 0 && !validation.isSuperAdmin()) {
        toast.error("Solo puedes tener una tarjeta. Edita la existente o contacta al administrador.");
        return;
      }

      console.log("Submitting form data:", data);
      console.log("Logo data being submitted:", data.logoUrl ? "Logo present" : "No logo");
      console.log("Avatar data being submitted:", data.avatarUrl ? "Avatar present" : "No avatar");
      console.log("Logo preview state:", connectedImages.logoPreview ? "Logo preview present" : "No logo preview");

      // Prepare final data ensuring all state is included
      const finalData = {
        ...data,
        links: links,
        themeColors: connectedColors.selectedColors,
        visibleFields: connectedVisibility.visibleFields,
        userId: validation.user?.id || "anonymous",
        // Ensure logo and avatar are included from current state - prioritize preview state
        avatarUrl: connectedImages.avatarPreview || data.avatarUrl || "",
        logoUrl: connectedImages.logoPreview || data.logoUrl || "",
        // Keep ID if editing
        id: initialData?.id || data.id
      };

      console.log("Final data being saved - Logo:", finalData.logoUrl ? "Logo present" : "No logo");
      console.log("Final data being saved - Avatar:", finalData.avatarUrl ? "Avatar present" : "No avatar");
      
      await saveCard(finalData);
      
      toast.success("Tarjeta guardada correctamente");
      navigate(`/card/${finalData.id}`);
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
      toast.error("Error al guardar la tarjeta");
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    setValue,
    watch,
    links,
    setLinks,
    avatarPreview: connectedImages.avatarPreview,
    logoPreview: connectedImages.logoPreview,
    setAvatarPreview: connectedImages.setAvatarPreview,
    setLogoPreview: connectedImages.setLogoPreview,
    existingCards: validation.existingCards,
    selectedColors: connectedColors.selectedColors,
    visibleFields: connectedVisibility.visibleFields,
    handleColorChange: connectedColors.handleColorChange,
    handleFieldVisibilityChange: connectedVisibility.handleFieldVisibilityChange,
    onSubmit,
    isSuperAdmin: validation.isSuperAdmin,
    user: validation.user,
  };
};
