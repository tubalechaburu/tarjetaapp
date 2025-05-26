
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
      themeColors: ["#000000", "#ffffff", "#dd8d0a"],
      visibleFields: {
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
    }
  });

  // Use the separated hooks with setValue connection
  const validation = useCardValidation(initialData);
  const colors = useCardColors(initialData, setValue);
  const images = useCardImages(initialData, setValue);
  const visibility = useCardVisibility(initialData, setValue);

  const onSubmit = async (data: BusinessCard) => {
    try {
      // Check if user already has a card and is not superadmin
      if (!initialData && validation.existingCards.length > 0 && !validation.isSuperAdmin()) {
        toast.error("Solo puedes tener una tarjeta. Edita la existente o contacta al administrador.");
        return;
      }

      console.log("Submitting form data:", data);
      console.log("Visibility fields being submitted:", data.visibleFields);
      console.log("Current visibility state:", visibility.visibleFields);

      // Prepare final data ensuring all state is included
      const finalData = {
        ...data,
        links: links,
        themeColors: colors.selectedColors,
        visibleFields: visibility.visibleFields, // Use the hook state
        userId: validation.user?.id || "anonymous",
        avatarUrl: images.avatarPreview || data.avatarUrl || "",
        logoUrl: images.logoPreview || data.logoUrl || "",
        id: initialData?.id || data.id
      };

      console.log("Final visibility data being saved:", finalData.visibleFields);
      
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
    avatarPreview: images.avatarPreview,
    logoPreview: images.logoPreview,
    setAvatarPreview: images.setAvatarPreview,
    setLogoPreview: images.setLogoPreview,
    existingCards: validation.existingCards,
    selectedColors: colors.selectedColors,
    visibleFields: visibility.visibleFields,
    handleColorChange: colors.handleColorChange,
    handleFieldVisibilityChange: visibility.handleFieldVisibilityChange,
    onSubmit,
    isSuperAdmin: validation.isSuperAdmin,
    user: validation.user,
  };
};
