
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthFormValues } from "@/types";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RegisterFormProps {
  onSubmit: (data: AuthFormValues) => Promise<void>;
  onSuccess: () => void;
}

const RegisterForm = ({ onSubmit, onSuccess }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const form = useForm<AuthFormValues>({
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      acceptTerms: false
    },
    mode: "onChange" // Validar al cambiar los campos
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (data: AuthFormValues) => {
    // Verificación explícita del checkbox
    if (data.acceptTerms !== true) {
      form.setError("acceptTerms", {
        type: "manual",
        message: "Debes aceptar los términos y condiciones"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      setRegistrationSuccess(true);
      onSuccess();
    } catch (error: any) {
      console.error("Error en registro:", error);
      form.setError("root", { 
        type: "manual", 
        message: error.message || "Error al registrarse. Por favor, inténtalo de nuevo." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <Mail className="h-4 w-4" />
          <AlertTitle>¡Registro exitoso!</AlertTitle>
          <AlertDescription>
            Te hemos enviado un correo de confirmación a tu dirección de email. 
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={onSuccess}
          className="w-full"
        >
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Nombre completo</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Tu nombre"
          {...form.register("fullName", {
            required: "El nombre es obligatorio"
          })}
        />
        {form.formState.errors.fullName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-email">Correo electrónico</Label>
        <Input
          id="register-email"
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
      
      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...form.register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres"
              }
            })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="terms" 
          onCheckedChange={(checked) => {
            form.setValue("acceptTerms", checked === true);
            // Limpiar el error si se marca el checkbox
            if (checked) {
              form.clearErrors("acceptTerms");
            }
          }}
          aria-invalid={form.formState.errors.acceptTerms ? "true" : "false"}
        />
        <div>
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Acepto los{" "}
            <Link to="/terms" className="text-primary hover:underline">
              términos y condiciones
            </Link>
            {" "}y la{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              política de privacidad
            </Link>
          </label>
          {form.formState.errors.acceptTerms && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.acceptTerms.message}
            </p>
          )}
        </div>
      </div>
      
      {/* Root error message */}
      {form.formState.errors.root && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        className="w-full mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
};

export default RegisterForm;
