
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BusinessCard, CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveCard, getCards } from "@/utils/storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

// Default theme colors - black, white, and orange
const DEFAULT_COLORS = ["#000000", "#ffffff", "#dd8d0a"];

export const useCardForm = (initialData?: BusinessCard) => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [links, setLinks] = useState<CardLink[]>(initialData?.links || []);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
  const [existingCards, setExistingCards] = useState<BusinessCard[]>([]);
  
  // Initialize with existing colors if available, with a proper fallback
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    if (initialData?.themeColors && initialData.themeColors.length === 3) {
      console.log("Using initial colors:", initialData.themeColors);
      return [...initialData.themeColors];
    }
    console.log("Using default colors:", DEFAULT_COLORS);
    return [...DEFAULT_COLORS];
  });
  
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
    }
  );

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
      themeColors: [...DEFAULT_COLORS],
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

  // Check existing cards on component mount
  useEffect(() => {
    const checkExistingCards = async () => {
      if (user && !initialData) {
        const cards = await getCards();
        const userCards = cards.filter(card => card.userId === user.id);
        setExistingCards(userCards);
      }
    };
    checkExistingCards();
  }, [user, initialData]);

  // Update form values when selectedColors change - critical for saving
  useEffect(() => {
    console.log("CardForm: Setting form colors to", selectedColors);
    setValue('themeColors', selectedColors, { shouldDirty: true });
  }, [selectedColors, setValue]);

  // Update form when logos/avatars change
  useEffect(() => {
    if (avatarPreview) {
      console.log("Updating avatarUrl in form:", avatarPreview ? "Avatar present" : "No avatar");
      setValue('avatarUrl', avatarPreview, { shouldDirty: true });
    }
  }, [avatarPreview, setValue]);

  useEffect(() => {
    if (logoPreview) {
      console.log("Updating logoUrl in form:", logoPreview ? "Logo present" : "No logo");
      setValue('logoUrl', logoPreview, { shouldDirty: true });
    }
  }, [logoPreview, setValue]);

  // Initialize form with initial data on mount
  useEffect(() => {
    if (initialData) {
      console.log("Initializing form with data:", initialData);
      setValue('themeColors', selectedColors, { shouldDirty: true });
      setValue('visibleFields', visibleFields, { shouldDirty: true });
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
  }, []);

  const handleColorChange = (index: number, color: string) => {
    console.log("CardForm: Color change requested", index, color);
    const newColors = [...selectedColors];
    newColors[index] = color;
    console.log("CardForm: New colors array", newColors);
    setSelectedColors(newColors);
  };
  
  const handleFieldVisibilityChange = (fieldName: string, isVisible: boolean) => {
    const updatedVisibility = { ...visibleFields, [fieldName]: isVisible };
    setVisibleFields(updatedVisibility);
    setValue('visibleFields', updatedVisibility, { shouldDirty: true });
  };

  const onSubmit = async (data: BusinessCard) => {
    try {
      // Check if user already has a card and is not superadmin
      if (!initialData && existingCards.length > 0 && !isSuperAdmin()) {
        toast.error("Solo puedes tener una tarjeta. Edita la existente o contacta al administrador.");
        return;
      }

      console.log("Submitting form data:", data);
      console.log("Logo data being submitted:", data.logoUrl ? "Logo present" : "No logo");
      console.log("Avatar data being submitted:", data.avatarUrl ? "Avatar present" : "No avatar");

      // Prepare final data ensuring all state is included
      const finalData = {
        ...data,
        links: links,
        themeColors: selectedColors,
        visibleFields: visibleFields,
        userId: user?.id || "anonymous",
        // Ensure logo and avatar are included from current state
        avatarUrl: avatarPreview || data.avatarUrl || "",
        logoUrl: logoPreview || data.logoUrl || "",
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
    avatarPreview,
    logoPreview,
    setAvatarPreview,
    setLogoPreview,
    existingCards,
    selectedColors,
    visibleFields,
    handleColorChange,
    handleFieldVisibilityChange,
    onSubmit,
    isSuperAdmin,
    user,
  };
};
