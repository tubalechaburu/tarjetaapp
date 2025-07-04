
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types";

export const signIn = async (email: string, password: string) => {
  console.log("Attempting to sign in with:", email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
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
      errorMessage = `Error de autenticación: ${error.message}`;
    }
    
    toast.error(errorMessage);
    throw error;
  }

  console.log("Sign in successful:", data.user?.email);
  toast.success("Sesión iniciada correctamente");
  return data;
};

export const signUp = async (email: string, password: string, metadata?: any) => {
  console.log("Attempting to sign up with:", email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/dashboard`
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    toast.error(error.message || "Error al registrarse");
    throw error;
  }

  console.log("Sign up successful:", data.user?.email);
  toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
  return data;
};

export const signOut = async () => {
  console.log("Attempting to sign out");
  
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
    toast.error(error.message || "Error al cerrar sesión");
    throw error;
  }
  
  console.log("Sign out successful");
  toast.success("Sesión cerrada correctamente");
  window.location.href = '/landing';
};

export const resetPassword = async (email: string) => {
  console.log("Attempting to reset password for:", email);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth`,
  });

  if (error) {
    console.error("Reset password error:", error);
    toast.error(error.message || "Error al enviar el correo de recuperación");
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
