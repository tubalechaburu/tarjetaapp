
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onCancel: () => void;
}

interface FormValues {
  email: string;
}

const ForgotPasswordForm = ({ onSubmit, onCancel }: ForgotPasswordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: {
      email: ""
    }
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Sending password reset to:", data.email);
      await onSubmit(data.email);
      setIsEmailSent(true);
      toast.success("Instrucciones de recuperación enviadas a tu correo.");
    } catch (error: any) {
      console.error("Error al solicitar recuperación:", error);
      toast.error(error.message || "Error al solicitar recuperación de contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Hemos enviado las instrucciones de recuperación a tu correo electrónico.
            Revisa tu bandeja de entrada y spam.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Button onClick={onCancel} className="w-full">
            Volver al inicio de sesión
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsEmailSent(false)} 
            className="w-full"
          >
            Enviar de nuevo
          </Button>
        </div>
      </div>
    );
  }

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
      
      <div className="text-sm text-muted-foreground">
        <p>
          Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
          El enlace de recuperación expirará en 24 horas.
        </p>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
