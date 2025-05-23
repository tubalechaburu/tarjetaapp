
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { BusinessCard, CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveCard } from "@/utils/storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import BasicInfoFields from "./card/BasicInfoFields";
import FieldVisibility from "./card/FieldVisibility";
import LinkManager from "./card/LinkManager";
import ThemeManager from "./card/ThemeManager";
import ImagesManager from "./card/ImagesManager";
import DescriptionField from "./card/DescriptionField";

interface CardFormProps {
  initialData?: BusinessCard;
}

// Define brand colors (not passed to ThemeManager anymore, but kept for initialization)
const BRAND_COLORS = [
  { name: "Dorado", hex: "#dd8d0a" },
  { name: "Blanco", hex: "#ffffff" },
  { name: "Negro", hex: "#000000" },
];

const CardForm: React.FC<CardFormProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [links, setLinks] = useState<CardLink[]>(initialData?.links || []);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
  
  // Initialize with existing colors if available, with a proper fallback
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialData?.themeColors && initialData.themeColors.length === 3 
      ? [...initialData.themeColors] // Create a new array to ensure reactivity
      : [BRAND_COLORS[0].hex, BRAND_COLORS[2].hex, BRAND_COLORS[0].hex]
  );
  
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
      email: "tubal@tubalechaburu.com",
      phone: "",
      website: "",
      address: "",
      avatarUrl: "",
      logoUrl: "",
      description: "",
      createdAt: Date.now(),
      themeColors: [BRAND_COLORS[0].hex, BRAND_COLORS[2].hex, BRAND_COLORS[0].hex],
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
    setValue('themeColors', selectedColors);
    console.log("CardForm: Colors updated in form", selectedColors);
  }, [selectedColors, setValue]);

  const handleColorChange = (index: number, color: string) => {
    console.log("CardForm: Color change requested", index, color);
    const newColors = [...selectedColors];
    newColors[index] = color;
    setSelectedColors(newColors);
    // Explicitly update the form value to ensure it's saved
    setValue('themeColors', newColors);
  };
  
  const handleFieldVisibilityChange = (fieldName: string, isVisible: boolean) => {
    const updatedVisibility = { ...visibleFields, [fieldName]: isVisible };
    setVisibleFields(updatedVisibility);
    setValue('visibleFields', updatedVisibility);
  };

  const onSubmit = async (data: BusinessCard) => {
    try {
      // Validar si hay enlaces sin URL
      const invalidLinks = links.filter(link => !link.url.trim());
      if (invalidLinks.length > 0) {
        toast.error("Todos los enlaces deben tener una URL");
        return;
      }

      // Log colors before submitting to verify they're correct
      console.log("Submitting with colors:", selectedColors);

      // Prepare final data with latest colors
      const finalData = {
        ...data,
        links: links,
        themeColors: selectedColors, // Use the state value to ensure latest colors
        visibleFields: visibleFields,
        userId: user?.id || "anonymous",
        // Keep ID if editing
        id: initialData?.id || data.id
      };

      console.log("Saving card with data:", finalData);
      await saveCard(finalData);
      
      toast.success("Tarjeta guardada correctamente");
      navigate(`/card/${finalData.id}`);
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
      toast.error("Error al guardar la tarjeta");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <BasicInfoFields register={register} errors={errors} />
        
        <DescriptionField register={register} />

        <ThemeManager 
          selectedColors={selectedColors} 
          onColorChange={handleColorChange} 
        />
        
        <FieldVisibility 
          visibleFields={visibleFields} 
          onChange={handleFieldVisibilityChange} 
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
