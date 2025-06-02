
import { supabase, getUserRole } from "@/integrations/supabase/client";
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

export const loadUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    console.log("Loading user role for:", userId);
    
    // Intentar obtener el rol del usuario con reintentos
    let retries = 3;
    let role: UserRole | null = null;
    
    while (retries > 0 && !role) {
      try {
        role = await getUserRole(userId);
        if (role) {
          console.log("User role received:", role);
          return role;
        }
      } catch (error) {
        console.warn(`Retry ${4 - retries} failed for getUserRole:`, error);
      }
      
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms antes del siguiente intento
      }
    }
    
    console.warn("Failed to load user role after retries, defaulting to 'user'");
    return 'user';
  } catch (error) {
    console.error("Error loading user role:", error);
    return 'user';
  }
};

export const isAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'superadmin';
};

export const isSuperAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'superadmin';
};
