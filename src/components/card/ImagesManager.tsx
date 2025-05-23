
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

  return (
    <>
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
    </>
  );
};

export default ImagesManager;
