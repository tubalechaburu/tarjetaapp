import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { BusinessCard, CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveCard, getCards } from "@/utils/storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import BasicInfoFields from "./card/BasicInfoFields";
import LinkManager from "./card/LinkManager";
import ThemeManager from "./card/ThemeManager";
import ImagesManager from "./card/ImagesManager";

interface CardFormProps {
  initialData?: BusinessCard;
}

// Define brand colors for initialization - black, white, and orange
const DEFAULT_COLORS = ["#000000", "#ffffff", "#dd8d0a"];

const CardForm: React.FC<CardFormProps> = ({ initialData }) => {
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

  // Update form values when selectedColors change - critical for saving
  useEffect(() => {
    console.log("CardForm: Setting form colors to", selectedColors);
    setValue('themeColors', selectedColors, { shouldDirty: true });
  }, [selectedColors, setValue]);

  // Also update form on initial load
  useEffect(() => {
    setValue('themeColors', selectedColors, { shouldDirty: true });
    setValue('visibleFields', visibleFields, { shouldDirty: true });
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

      // Validar si hay enlaces sin URL
      const invalidLinks = links.filter(link => !link.url.trim());
      if (invalidLinks.length > 0) {
        toast.error("Todos los enlaces deben tener una URL");
        return;
      }

      // Log colors before submitting to verify they're correct
      console.log("Submitting with selectedColors state:", selectedColors);
      console.log("Submitting with form data colors:", data.themeColors);

      // Prepare final data with latest colors from state (more reliable)
      const finalData = {
        ...data,
        links: links,
        themeColors: selectedColors, // Use the state value to ensure latest colors
        visibleFields: visibleFields,
        userId: user?.id || "anonymous",
        // Keep ID if editing
        id: initialData?.id || data.id
      };

      console.log("Final data being saved:", finalData);
      console.log("Final theme colors:", finalData.themeColors);
      
      await saveCard(finalData);
      
      toast.success("Tarjeta guardada correctamente");
      navigate(`/card/${finalData.id}`);
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
      toast.error("Error al guardar la tarjeta");
    }
  };

  // Show warning if user already has a card and is not editing
  if (!initialData && existingCards.length > 0 && !isSuperAdmin()) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Ya tienes una tarjeta</h2>
        <p className="mb-6">Solo puedes tener una tarjeta digital. Puedes editar la existente.</p>
        <Button onClick={() => navigate(`/edit/${existingCards[0].id}`)}>
          Editar mi tarjeta
        </Button>
      </div>
    );
  }

  console.log("CardForm render - selectedColors:", selectedColors);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <BasicInfoFields 
          register={register} 
          errors={errors}
          visibleFields={visibleFields}
          onFieldVisibilityChange={handleFieldVisibilityChange}
        />

        <ThemeManager 
          selectedColors={selectedColors} 
          onColorChange={handleColorChange} 
        />

        <ImagesManager
          register={register}
          setValue={setValue}
          avatarPreview={avatarPreview}
          logoPreview={logoPreview}
          setAvatarPreview={setAvatarPreview}
          setLogoPreview={setLogoPreview}
        />

        <LinkManager links={links} setLinks={setLinks} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Guardar Tarjeta"}
      </Button>
    </form>
  );
};

export default CardForm;
