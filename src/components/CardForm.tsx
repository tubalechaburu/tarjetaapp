import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { BusinessCard, CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveCard } from "@/utils/storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LinksForm from "./LinksForm";
import { useAuth } from "@/providers/AuthProvider";
import BasicInfoFields from "./card/BasicInfoFields";
import ImageUploader from "./card/ImageUploader";
import ColorSelector from "./card/ColorSelector";

interface CardFormProps {
  initialData?: BusinessCard;
}

// Define brand colors
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
  
  // Update color definitions - first color is background, second is text, third is highlight
  const [selectedColors, setSelectedColors] = useState<string[]>(
    initialData?.themeColors || [BRAND_COLORS[0].hex, BRAND_COLORS[2].hex, BRAND_COLORS[0].hex]
  );
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<BusinessCard>({
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
      createdAt: Date.now(),
      themeColors: [BRAND_COLORS[0].hex, BRAND_COLORS[2].hex, BRAND_COLORS[0].hex]
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setValue('avatarUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setValue('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...selectedColors];
    newColors[index] = color;
    setSelectedColors(newColors);
    setValue('themeColors', newColors);
  };

  const onSubmit = async (data: BusinessCard) => {
    try {
      // Asegurarse de que haya al menos un enlace (si es obligatorio)
      if (links.length === 0) {
        toast.error("Añade al menos un enlace a tu tarjeta");
        return;
      }

      // Validar si hay enlaces sin URL
      const invalidLinks = links.filter(link => !link.url.trim());
      if (invalidLinks.length > 0) {
        toast.error("Todos los enlaces deben tener una URL");
        return;
      }

      // Guardar la tarjeta con los enlaces y los colores seleccionados
      await saveCard({
        ...data,
        links: links,
        themeColors: selectedColors,
        userId: user?.id || "anonymous" // Usar el ID del usuario si está autenticado
      });
      
      toast.success("Tarjeta guardada exitosamente");
      navigate(`/card/${data.id}`);
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
      toast.error("Error al guardar la tarjeta");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <BasicInfoFields register={register} errors={errors} />

        {/* Selector de colores con propósitos definidos */}
        <ColorSelector 
          selectedColors={selectedColors} 
          onChange={handleColorChange} 
          brandColors={BRAND_COLORS} 
        />

        <ImageUploader
          id="avatar-upload"
          label="Imagen de perfil"
          description="Sube una foto de perfil para tu tarjeta"
          preview={avatarPreview}
          onChange={handleAvatarChange}
        />
        <input
          type="hidden"
          {...register("avatarUrl")}
        />

        <ImageUploader
          id="logo-upload"
          label="Logo de empresa"
          description="Sube el logo de tu empresa para tu tarjeta"
          preview={logoPreview}
          onChange={handleLogoChange}
        />
        <input
          type="hidden"
          {...register("logoUrl")}
        />

        {/* Formulario de enlaces */}
        <LinksForm links={links} setLinks={setLinks} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Guardar Tarjeta"}
      </Button>
    </form>
  );
};

export default CardForm;
