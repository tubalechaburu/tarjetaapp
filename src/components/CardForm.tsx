
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

interface CardFormProps {
  initialData?: BusinessCard;
}

const CardForm: React.FC<CardFormProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [links, setLinks] = useState<CardLink[]>(initialData?.links || []);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BusinessCard>({
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
      createdAt: Date.now(),
    }
  });

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

      // Guardar la tarjeta con los enlaces
      await saveCard({
        ...data,
        links: links,
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

        <div>
          <Label htmlFor="avatarUrl">URL de imagen de perfil</Label>
          <Input id="avatarUrl" {...register("avatarUrl")} />
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
