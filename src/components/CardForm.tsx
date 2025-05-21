
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessCard, CardLink } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveCard } from "@/utils/storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LinksForm from "./LinksForm";
import { useAuth } from "@/providers/AuthProvider";
import { Upload, Image } from "lucide-react";

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
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.themeColors || [BRAND_COLORS[0].hex, BRAND_COLORS[1].hex, BRAND_COLORS[2].hex]);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<BusinessCard>({
    defaultValues: initialData || {
      id: uuidv4(),
      name: "",
      jobTitle: "",
      company: "",
      email: "tubal@tubalechaburu.com", // Valor predeterminado como solicitado
      phone: "",
      website: "",
      address: "",
      avatarUrl: "",
      logoUrl: "",
      createdAt: Date.now(),
      themeColors: [BRAND_COLORS[0].hex, BRAND_COLORS[1].hex, BRAND_COLORS[2].hex]
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
        <div>
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            {...register("name", { required: "El nombre es obligatorio" })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input
            id="email"
            type="email"
            defaultValue="tubal@tubalechaburu.com"
            {...register("email", { 
              required: "El correo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Dirección de correo inválida"
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="jobTitle">Puesto</Label>
          <Input
            id="jobTitle"
            {...register("jobTitle")}
          />
        </div>

        <div>
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            {...register("company")}
          />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" {...register("address")} />
        </div>

        {/* Selector de colores */}
        <div className="space-y-2">
          <Label>Colores de la tarjeta (máximo 3)</Label>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded border" 
                    style={{ backgroundColor: selectedColors[index] || '#ffffff' }}
                  />
                  <Input
                    type="color"
                    value={selectedColors[index] || '#ffffff'}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-full h-10"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {BRAND_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleColorChange(index, color.hex)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Selecciona hasta 3 colores para personalizar tu tarjeta
          </p>
        </div>

        <div className="space-y-2">
          <Label>Imagen de perfil</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir imagen
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Sube una foto de perfil para tu tarjeta
              </p>
            </div>
          </div>
          <input
            type="hidden"
            {...register("avatarUrl")}
          />
        </div>

        <div className="space-y-2">
          <Label>Logo de empresa</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Vista previa del logo" 
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir logo
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Sube el logo de tu empresa para tu tarjeta
              </p>
            </div>
          </div>
          <input
            type="hidden"
            {...register("logoUrl")}
          />
        </div>

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
