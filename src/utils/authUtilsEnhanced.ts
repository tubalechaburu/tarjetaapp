
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types";
import { validatePasswordStrength, sanitizeUserInput, validateEmail } from "./supabase/securityEnhancements";

export const signInSecure = async (email: string, password: string) => {
  console.log("Attempting secure sign in with:", email);
  
  // Input validation
  if (!validateEmail(email)) {
    const error = new Error("Formato de email inválido");
    toast.error("Formato de email inválido");
    throw error;
  }
  
  if (!password || password.length < 8) {
    const error = new Error("Contraseña inválida");
    toast.error("Contraseña demasiado corta");
    throw error;
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: sanitizeUserInput(email, 254),
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    let errorMessage = "Error de autenticación";
    
    if (error.message === "Invalid login credentials") {
      errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Debes confirmar tu email antes de iniciar sesión.";
    } else if (error.message.includes("too many requests")) {
      errorMessage = "Demasiados intentos. Espera unos minutos antes de intentar de nuevo.";
    } else {
      errorMessage = "Error de autenticación. Inténtalo de nuevo.";
    }
    
    toast.error(errorMessage);
    throw error;
  }

  console.log("Sign in successful:", data.user?.email);
  toast.success("Sesión iniciada correctamente");
  return data;
};

export const signUpSecure = async (email: string, password: string, metadata?: any) => {
  console.log("Attempting secure sign up with:", email);
  
  // Enhanced input validation
  if (!validateEmail(email)) {
    const error = new Error("Formato de email inválido");
    toast.error("Formato de email inválido");
    throw error;
  }
  
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    const error = new Error("Contraseña no cumple los requisitos de seguridad");
    toast.error(`Contraseña insegura: ${passwordValidation.errors.join(', ')}`);
    throw error;
  }
  
  // Sanitize metadata
  const sanitizedMetadata = metadata ? {
    full_name: sanitizeUserInput(metadata.full_name || '', 100)
  } : undefined;
  
  const { data, error } = await supabase.auth.signUp({
    email: sanitizeUserInput(email, 254),
    password,
    options: {
      data: sanitizedMetadata,
      emailRedirectTo: `${window.location.origin}/dashboard`
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    
    let errorMessage = "Error al registrarse";
    if (error.message.includes("already registered")) {
      errorMessage = "Este email ya está registrado. Intenta iniciar sesión.";
    } else if (error.message.includes("invalid email")) {
      errorMessage = "Formato de email inválido";
    } else if (error.message.includes("weak password")) {
      errorMessage = "La contraseña es demasiado débil";
    }
    
    toast.error(errorMessage);
    throw error;
  }

  console.log("Sign up successful:", data.user?.email);
  toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
  return data;
};

export const signOutSecure = async () => {
  console.log("Attempting secure sign out");
  
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
    toast.error("Error al cerrar sesión");
    throw error;
  }
  
  console.log("Sign out successful");
  toast.success("Sesión cerrada correctamente");
  
  // Clear any sensitive data from localStorage
  try {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-tsrspstmwuxjqjnrymwm-auth-token');
  } catch (e) {
    console.warn("Could not clear auth tokens from localStorage");
  }
  
  window.location.href = '/landing';
};

export const resetPasswordSecure = async (email: string) => {
  console.log("Attempting secure password reset for:", email);
  
  if (!validateEmail(email)) {
    const error = new Error("Formato de email inválido");
    toast.error("Formato de email inválido");
    throw error;
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(
    sanitizeUserInput(email, 254), 
    {
      redirectTo: `${window.location.origin}/auth`,
    }
  );

  if (error) {
    console.error("Reset password error:", error);
    toast.error("Error al enviar el correo de recuperación");
    throw error;
  }

  toast.success("Instrucciones enviadas a tu correo electrónico");
};

export const isAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'superadmin';
};

export const isSuperAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'superadmin';
};
