
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister } from "react-hook-form";
import { BusinessCard } from "@/types";

interface DescriptionFieldProps {
  register: UseFormRegister<BusinessCard>;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({ register }) => {
  return (
    <div>
      <Label htmlFor="description">Descripción</Label>
      <Textarea
        id="description"
        placeholder="Describe tu perfil profesional, servicios o competencias"
        className="min-h-[100px]"
        {...register("description")}
      />
    </div>
  );
};

export default DescriptionField;
