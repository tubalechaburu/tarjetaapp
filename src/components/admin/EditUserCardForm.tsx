
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BusinessCard } from "@/types";
import { saveCard, getCardById } from "@/utils/storage";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import ImageUploader from "@/components/card/ImageUploader";

interface EditUserCardFormProps {
  cardId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const EditUserCardForm: React.FC<EditUserCardFormProps> = ({
  cardId,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BusinessCard>();

  useEffect(() => {
    const loadCard = async () => {
      try {
        const cardData = await getCardById(cardId);
        if (cardData) {
          setCard(cardData);
          setAvatarPreview(cardData.avatarUrl || null);
          setLogoPreview(cardData.logoUrl || null);
          setVisibleFields(cardData.visibleFields || {
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
          });

          // Set form values
          setValue('name', cardData.name);
          setValue('jobTitle', cardData.jobTitle);
          setValue('company', cardData.company);
          setValue('email', cardData.email);
          setValue('phone', cardData.phone);
          setValue('website', cardData.website);
          setValue('address', cardData.address);
          setValue('description', cardData.description);
          setValue('avatarUrl', cardData.avatarUrl);
          setValue('logoUrl', cardData.logoUrl);
        }
      } catch (error) {
        console.error("Error loading card:", error);
        toast.error("Error al cargar la tarjeta");
      }
    };

    loadCard();
  }, [cardId, setValue]);

  const handleFieldVisibilityChange = (fieldName: string, isVisible: boolean) => {
    setVisibleFields(prev => ({ ...prev, [fieldName]: isVisible }));
  };

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

  const onSubmit = async (data: BusinessCard) => {
    if (!card) return;

    setLoading(true);
    try {
      const updatedCard: BusinessCard = {
        ...card,
        ...data,
        visibleFields,
        avatarUrl: avatarPreview || "",
        logoUrl: logoPreview || "",
        themeColors: card.themeColors,
        links: card.links,
      };

      console.log("Saving updated card with visibility:", updatedCard.visibleFields);
      await saveCard(updatedCard);
      toast.success("Tarjeta actualizada correctamente");
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error("Error al guardar la tarjeta");
    } finally {
      setLoading(false);
    }
  };

  if (!card) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Editar Tarjeta de {card.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "El nombre es obligatorio" })}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="jobTitle">Cargo</Label>
                <Input id="jobTitle" {...register("jobTitle")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" {...register("company")} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div>
                <Label htmlFor="website">Sitio web</Label>
                <Input id="website" {...register("website")} />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register("address")} />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" {...register("description")} />
            </div>

            {/* Imágenes */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Imagen de perfil</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="visibility-avatarUrl" className="text-sm text-muted-foreground">
                      Mostrar
                    </Label>
                    <Switch
                      id="visibility-avatarUrl"
                      checked={visibleFields.avatarUrl ?? true}
                      onCheckedChange={(checked) => handleFieldVisibilityChange('avatarUrl', checked)}
                    />
                  </div>
                </div>
                <ImageUploader
                  id="avatar-upload"
                  label=""
                  description="Sube una foto de perfil para la tarjeta"
                  preview={avatarPreview}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Logo de empresa</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="visibility-logoUrl" className="text-sm text-muted-foreground">
                      Mostrar
                    </Label>
                    <Switch
                      id="visibility-logoUrl"
                      checked={visibleFields.logoUrl ?? true}
                      onCheckedChange={(checked) => handleFieldVisibilityChange('logoUrl', checked)}
                    />
                  </div>
                </div>
                <ImageUploader
                  id="logo-upload"
                  label=""
                  description="Sube el logo de la empresa para la tarjeta"
                  preview={logoPreview}
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            {/* Controles de visibilidad */}
            <div className="space-y-3">
              <h3 className="font-medium">Campos visibles en la tarjeta</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries({
                  name: "Nombre",
                  jobTitle: "Cargo",
                  company: "Empresa",
                  email: "Email",
                  phone: "Teléfono",
                  website: "Sitio web",
                  address: "Dirección",
                  description: "Descripción",
                }).map(([field, label]) => (
                  <div key={field} className="flex items-center justify-between">
                    <Label htmlFor={`visibility-${field}`} className="text-sm">
                      {label}
                    </Label>
                    <Switch
                      id={`visibility-${field}`}
                      checked={visibleFields[field] ?? true}
                      onCheckedChange={(checked) => handleFieldVisibilityChange(field, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
