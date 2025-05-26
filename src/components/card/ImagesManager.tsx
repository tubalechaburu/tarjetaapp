
import React from "react";
import ImageUploader from "./ImageUploader";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { BusinessCard } from "@/types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ImagesManagerProps {
  register: UseFormRegister<BusinessCard>;
  setValue: UseFormSetValue<BusinessCard>;
  avatarPreview: string | null;
  logoPreview: string | null;
  setAvatarPreview: (url: string | null) => void;
  setLogoPreview: (url: string | null) => void;
  visibleFields: Record<string, boolean>;
  onFieldVisibilityChange: (fieldName: string, isVisible: boolean) => void;
}

const ImagesManager: React.FC<ImagesManagerProps> = ({
  register,
  setValue,
  avatarPreview,
  logoPreview,
  setAvatarPreview,
  setLogoPreview,
  visibleFields,
  onFieldVisibilityChange,
}) => {
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log("Avatar loaded:", result.substring(0, 50) + "...");
        setAvatarPreview(result);
        setValue('avatarUrl', result, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
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
        console.log("Logo loaded successfully - base64 data:", result.substring(0, 100) + "...");
        setLogoPreview(result);
        setValue('logoUrl', result, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        console.log("Logo set in form successfully");
      };
      reader.onerror = () => {
        console.error("Error reading logo file");
      };
      reader.readAsDataURL(file);
    }
  };

  const ImageFieldWithVisibility = ({ 
    id, 
    label, 
    description,
    preview,
    onChange 
  }: {
    id: string;
    label: string;
    description: string;
    preview: string | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2">
          <Label htmlFor={`visibility-${id}`} className="text-sm text-muted-foreground">
            Mostrar
          </Label>
          <Switch
            id={`visibility-${id}`}
            checked={visibleFields[id] ?? true}
            onCheckedChange={(checked) => onFieldVisibilityChange(id, checked)}
          />
        </div>
      </div>
      <ImageUploader
        id={`${id}-upload`}
        label=""
        description={description}
        preview={preview}
        onChange={onChange}
      />
    </div>
  );

  return (
    <>
      <ImageFieldWithVisibility
        id="avatarUrl"
        label="Imagen de perfil"
        description="Sube una foto de perfil para tu tarjeta"
        preview={avatarPreview}
        onChange={handleAvatarChange}
      />

      <ImageFieldWithVisibility
        id="logoUrl"
        label="Logo de empresa"
        description="Sube el logo de tu empresa para tu tarjeta"
        preview={logoPreview}
        onChange={handleLogoChange}
      />
    </>
  );
};

export default ImagesManager;
