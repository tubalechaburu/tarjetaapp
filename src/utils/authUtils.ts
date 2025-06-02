
import { supabase, getUserRole } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types";

export const signIn = async (email: string, password: string) => {
  console.log("Attempting to sign in with:", email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
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

    console.log("Sign in successful:", data);
    toast.success("Sesión iniciada correctamente");
  } catch (error) {
    console.error("Exception during sign in:", error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, metadata?: any) => {
  console.log("Attempting to sign up with:", email);
  
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Error al registrarse");
      throw error;
    }

    toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
  } catch (error) {
    console.error("Exception during sign up:", error);
    throw error;
  }
};

export const signOut = async () => {
  console.log("Attempting to sign out");
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Error al cerrar sesión");
      throw error;
    }
    
    console.log("Sign out successful");
    toast.success("Sesión cerrada correctamente");
    window.location.href = '/landing';
  } catch (error) {
    console.error("Exception during sign out:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  console.log("Attempting to reset password for:", email);
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Error al enviar el correo de recuperación");
      throw error;
    }

    toast.success("Instrucciones enviadas a tu correo electrónico");
  } catch (error) {
    console.error("Exception during password reset:", error);
    throw error;
  }
};

export const loadUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    console.log("Loading user role for:", userId);
    const role = await getUserRole(userId);
    console.log("User role received:", role);
    return role;
  } catch (error) {
    console.error("Error loading user role:", error);
    return 'user'; // Default fallback
  }
};

export const isAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'superadmin';
};

export const isSuperAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'superadmin';
};
