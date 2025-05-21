
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessCard } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveCard } from "@/utils/storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CardFormProps {
  initialData?: BusinessCard;
}

const CardForm: React.FC<CardFormProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<BusinessCard>({
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

  const onSubmit = (data: BusinessCard) => {
    saveCard(data);
    toast.success("Tarjeta guardada exitosamente");
    navigate(`/card/${data.id}`);
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
          <Label htmlFor="jobTitle">Puesto *</Label>
          <Input
            id="jobTitle"
            {...register("jobTitle", { required: "El puesto es obligatorio" })}
          />
          {errors.jobTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.jobTitle.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="company">Empresa *</Label>
          <Input
            id="company"
            {...register("company", { required: "La empresa es obligatoria" })}
          />
          {errors.company && (
            <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
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
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            {...register("phone", { required: "El teléfono es obligatorio" })}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="website">Sitio web (opcional)</Label>
          <Input id="website" {...register("website")} />
        </div>

        <div>
          <Label htmlFor="address">Dirección (opcional)</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div>
          <Label htmlFor="avatarUrl">URL de imagen de perfil (opcional)</Label>
          <Input id="avatarUrl" {...register("avatarUrl")} />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Guardar Tarjeta
      </Button>
    </form>
  );
};

export default CardForm;
