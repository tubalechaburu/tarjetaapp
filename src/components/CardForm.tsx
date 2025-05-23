
import React from "react";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/types";
import { useCardForm } from "@/hooks/useCardForm";
import BasicInfoFields from "./card/BasicInfoFields";
import LinkManager from "./card/LinkManager";
import ThemeManager from "./card/ThemeManager";
import ImagesManager from "./card/ImagesManager";
import ExistingCardWarning from "./card/ExistingCardWarning";

interface CardFormProps {
  initialData?: BusinessCard;
}

const CardForm: React.FC<CardFormProps> = ({ initialData }) => {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
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
    setValue,
  } = useCardForm(initialData);

  // Show warning if user already has a card and is not editing
  if (!initialData && existingCards.length > 0 && !isSuperAdmin()) {
    return <ExistingCardWarning existingCards={existingCards} />;
  }

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
