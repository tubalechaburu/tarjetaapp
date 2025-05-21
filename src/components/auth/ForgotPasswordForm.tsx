
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onCancel: () => void;
}

interface FormValues {
  email: string;
}

const ForgotPasswordForm = ({ onSubmit, onCancel }: ForgotPasswordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: {
      email: ""
    }
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data.email);
      toast.success("Instrucciones de recuperación enviadas a tu correo.");
    } catch (error: any) {
      console.error("Error al solicitar recuperación:", error);
      toast.error(error.message || "Error al solicitar recuperación de contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          {...form.register("email", {
            required: "El correo electrónico es obligatorio",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Dirección de correo inválida"
            }
          })}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? "Enviando..." 
            : "Enviar instrucciones"}
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
        >
          Volver al inicio de sesión
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
