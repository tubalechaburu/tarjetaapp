
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BusinessCard } from "@/types";

interface BasicInfoFieldsProps {
  register: UseFormRegister<BusinessCard>;
  errors: FieldErrors<BusinessCard>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ register, errors }) => {
  return (
    <>
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
              message: "Dirección de correo inválida",
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="jobTitle">Puesto</Label>
        <Input id="jobTitle" {...register("jobTitle")} />
      </div>

      <div>
        <Label htmlFor="company">Empresa</Label>
        <Input id="company" {...register("company")} />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" {...register("phone")} />
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" {...register("address")} />
      </div>
    </>
  );
};

export default BasicInfoFields;
