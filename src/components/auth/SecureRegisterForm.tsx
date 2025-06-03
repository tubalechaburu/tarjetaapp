
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormValues } from "@/types";
import { Eye, EyeOff, Shield, Check, X } from "lucide-react";
import { validatePasswordStrength, validateEmail, sanitizeUserInput } from "@/utils/supabase/securityEnhancements";

interface SecureRegisterFormProps {
  onSubmit: (data: AuthFormValues) => Promise<void>;
  onSuccess: () => void;
}

const SecureRegisterForm: React.FC<SecureRegisterFormProps> = ({ onSubmit, onSuccess }) => {
  const [formData, setFormData] = useState<AuthFormValues>({
    email: "",
    password: "",
    fullName: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: false,
    errors: []
  });

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordValidation(validatePasswordStrength(password));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = "El nombre debe tener al menos 2 caracteres";
    }

    if (!passwordValidation.isValid) {
      newErrors.password = "La contraseña no cumple los requisitos de seguridad";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedData = {
        ...formData,
        email: sanitizeUserInput(formData.email, 254),
        fullName: sanitizeUserInput(formData.fullName || '', 100)
      };
      await onSubmit(sanitizedData);
      onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
        <Shield className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">Registro seguro protegido</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Tu nombre completo"
          required
          autoComplete="name"
          className={errors.fullName ? "border-red-500" : ""}
        />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="tu@email.com"
          required
          autoComplete="email"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Contraseña segura"
            required
            autoComplete="new-password"
            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Password strength indicator */}
        {formData.password && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {passwordValidation.isValid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                Requisitos de seguridad
              </span>
            </div>
            {!passwordValidation.isValid && (
              <ul className="text-xs text-gray-600 ml-6 space-y-1">
                <li>• Mínimo 8 caracteres</li>
                <li>• Al menos una mayúscula</li>
                <li>• Al menos una minúscula</li>
                <li>• Al menos un número</li>
                <li>• Al menos un carácter especial</li>
              </ul>
            )}
          </div>
        )}
        
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="acceptTerms"
          checked={formData.acceptTerms}
          onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
          className="rounded border-gray-300 mt-1"
        />
        <Label htmlFor="acceptTerms" className="text-sm leading-5">
          Acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-blue-600 hover:underline">política de privacidad</a>
        </Label>
      </div>
      {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}

      <Button type="submit" className="w-full" disabled={isLoading || !passwordValidation.isValid}>
        {isLoading ? "Registrando..." : "Crear cuenta"}
      </Button>
    </form>
  );
};

export default SecureRegisterForm;
