
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthFormValues } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  onForgotPassword: () => void;
  onSubmit: (data: AuthFormValues) => Promise<void>;
}

export const LoginForm = ({ onForgotPassword, onSubmit }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AuthFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (data: AuthFormValues) => {
    if (isSubmitting) return;
    
    console.log("LoginForm: handleSubmit called with:", { email: data.email });
    
    if (!data.email || !data.password) {
      form.setError("root", {
        type: "manual",
        message: "Por favor completa todos los campos"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Limpiar errores previos
      form.clearErrors();
      console.log("LoginForm: Calling onSubmit...");
      await onSubmit(data);
      console.log("LoginForm: onSubmit completed successfully");
    } catch (error: any) {
      console.error("LoginForm: Error during submit:", error);
      
      // Mostrar mensaje de error específico
      let errorMessage = "Error al iniciar sesión. Por favor, inténtalo de nuevo.";
      
      if (error.message) {
        if (error.message.includes("Invalid login credentials") || 
            error.message.includes("Invalid credentials") ||
            error.message.includes("Credenciales incorrectas")) {
          errorMessage = "Email o contraseña incorrectos. Verifica tus datos.";
        } else if (error.message.includes("Email not confirmed") ||
                   error.message.includes("no confirmado")) {
          errorMessage = "Debes confirmar tu email antes de iniciar sesión. Revisa tu correo.";
        } else if (error.message.includes("too many requests") ||
                   error.message.includes("Account temporarily locked")) {
          errorMessage = "Demasiados intentos fallidos. Espera unos minutos antes de intentar de nuevo.";
        } else {
          errorMessage = error.message;
        }
      }
      
      form.setError("root", {
        type: "manual",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="tu@email.com"
          disabled={isSubmitting}
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
        <div className="flex justify-between items-center">
          <Label htmlFor="login-password">Contraseña</Label>
          <Button 
            type="button"
            variant="link" 
            className="p-0 h-auto text-xs"
            onClick={onForgotPassword}
            disabled={isSubmitting}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember" 
          disabled={isSubmitting}
          onCheckedChange={(checked) => {
            form.setValue("rememberMe", checked === true);
          }}
        />
        <label
          htmlFor="remember"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Recordar en este dispositivo
        </label>
      </div>
      
      {form.formState.errors.root && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
};

export default LoginForm;
