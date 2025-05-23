
import React from "react";
import ImageUploader from "./ImageUploader";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { BusinessCard } from "@/types";

interface ImagesManagerProps {
  register: UseFormRegister<BusinessCard>;
  setValue: UseFormSetValue<BusinessCard>;
  avatarPreview: string | null;
  logoPreview: string | null;
  setAvatarPreview: (url: string | null) => void;
  setLogoPreview: (url: string | null) => void;
}

const ImagesManager: React.FC<ImagesManagerProps> = ({
  register,
  setValue,
  avatarPreview,
  logoPreview,
  setAvatarPreview,
  setLogoPreview,
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
        console.log("Logo loaded successfully:", result.substring(0, 50) + "...");
        setLogoPreview(result);
        setValue('logoUrl', result, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <ImageUploader
        id="avatar-upload"
        label="Imagen de perfil"
        description="Sube una foto de perfil para tu tarjeta"
        preview={avatarPreview}
        onChange={handleAvatarChange}
      />

      <ImageUploader
        id="logo-upload"
        label="Logo de empresa"
        description="Sube el logo de tu empresa para tu tarjeta"
        preview={logoPreview}
        onChange={handleLogoChange}
      />
    </>
  );
};

export default ImagesManager;
