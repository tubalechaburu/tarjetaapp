
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BusinessCard } from "@/types";

interface BasicInfoFieldsProps {
  register: UseFormRegister<BusinessCard>;
  errors: FieldErrors<BusinessCard>;
  visibleFields: Record<string, boolean>;
  onFieldVisibilityChange: (fieldName: string, isVisible: boolean) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  register, 
  errors, 
  visibleFields, 
  onFieldVisibilityChange 
}) => {
  const FieldWithVisibility = ({ 
    id, 
    label, 
    required = false, 
    type = "text", 
    children, 
    error 
  }: {
    id: string;
    label: string;
    required?: boolean;
    type?: string;
    children: React.ReactNode;
    error?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label} {required && "*"}</Label>
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
      {children}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <FieldWithVisibility
        id="name"
        label="Nombre completo"
        required
        error={errors.name?.message}
      >
        <Input
          id="name"
          {...register("name", { required: "El nombre es obligatorio" })}
        />
      </FieldWithVisibility>

      <FieldWithVisibility
        id="email"
        label="Correo electrónico"
        required
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          {...register("email", {
            required: "El correo es obligatorio",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Dirección de correo inválida",
            },
          })}
        />
      </FieldWithVisibility>

      <FieldWithVisibility
        id="description"
        label="Descripción profesional"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="Describe tu perfil profesional, servicios o competencias"
          {...register("description")}
          className="min-h-[100px]"
        />
      </FieldWithVisibility>

      <FieldWithVisibility
        id="jobTitle"
        label="Puesto"
        error={errors.jobTitle?.message}
      >
        <Input id="jobTitle" {...register("jobTitle")} />
      </FieldWithVisibility>

      <FieldWithVisibility
        id="company"
        label="Empresa"
        error={errors.company?.message}
      >
        <Input id="company" {...register("company")} />
      </FieldWithVisibility>

      <FieldWithVisibility
        id="phone"
        label="Teléfono"
        error={errors.phone?.message}
      >
        <Input id="phone" {...register("phone")} />
      </FieldWithVisibility>

      <FieldWithVisibility
        id="website"
        label="Sitio web"
        error={errors.website?.message}
      >
        <Input id="website" {...register("website")} />
      </FieldWithVisibility>

      <FieldWithVisibility
        id="address"
        label="Dirección"
        error={errors.address?.message}
      >
        <Input id="address" {...register("address")} />
      </FieldWithVisibility>
    </div>
  );
};

export default BasicInfoFields;
