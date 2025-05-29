
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      toast.error("Credenciales incorrectas. Verifica tu email y contraseña.");
    } else if (error.message.includes("Email not confirmed")) {
      toast.error("Debes confirmar tu email antes de iniciar sesión.");
    } else if (error.message.includes("too many requests")) {
      toast.error("Demasiados intentos. Espera unos minutos antes de intentar de nuevo.");
    } else {
      toast.error(`Error de autenticación: ${error.message}`);
    }
    throw error;
  }

  toast.success("Sesión iniciada correctamente");
};

export const signUp = async (email: string, password: string, metadata?: any) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    toast.error(error.message || "Error al registrarse");
    console.error("Error al registrarse:", error);
    throw error;
  }

  toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast.error(error.message || "Error al cerrar sesión");
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
  toast.success("Sesión cerrada correctamente");
  window.location.href = '/landing';
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    toast.error(error.message || "Error al enviar el correo de recuperación");
    console.error("Error al enviar el correo de recuperación:", error);
    throw error;
  }

  toast.success("Instrucciones enviadas a tu correo electrónico");
};
