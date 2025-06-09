
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateEmail, validatePassword, sanitizeInput, sanitizeErrorMessage } from "./validation";

interface SignInAttempt {
  timestamp: number;
  email: string;
}

class AuthService {
  private maxAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private attemptKey = 'auth_attempts';

  private getAttempts(): SignInAttempt[] {
    try {
      const stored = localStorage.getItem(this.attemptKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setAttempts(attempts: SignInAttempt[]): void {
    try {
      localStorage.setItem(this.attemptKey, JSON.stringify(attempts));
    } catch {
      // Fail silently if localStorage is not available
    }
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.getAttempts();
    const recentAttempts = attempts.filter(
      attempt => 
        attempt.email === email && 
        Date.now() - attempt.timestamp < this.lockoutDuration
    );
    
    return recentAttempts.length >= this.maxAttempts;
  }

  private recordFailedAttempt(email: string): void {
    const attempts = this.getAttempts();
    attempts.push({ timestamp: Date.now(), email });
    
    // Keep only recent attempts to prevent storage bloat
    const recentAttempts = attempts.filter(
      attempt => Date.now() - attempt.timestamp < this.lockoutDuration
    );
    
    this.setAttempts(recentAttempts);
  }

  private clearAttempts(email: string): void {
    const attempts = this.getAttempts();
    const filteredAttempts = attempts.filter(attempt => attempt.email !== email);
    this.setAttempts(filteredAttempts);
  }

  async signIn(email: string, password: string): Promise<void> {
    // Input validation
    if (!validateEmail(email)) {
      throw new Error('Por favor introduce una dirección de correo válida');
    }

    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Check for account lockout
    if (this.isAccountLocked(email)) {
      throw new Error('Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtalo de nuevo en 15 minutos.');
    }

    const sanitizedEmail = sanitizeInput(email, 254);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        this.recordFailedAttempt(sanitizedEmail);
        
        // Mejorar los mensajes de error
        let errorMessage = "Error al iniciar sesión";
        
        if (error.message === "Invalid login credentials") {
          errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Debes confirmar tu email antes de iniciar sesión. Revisa tu correo.";
        } else if (error.message.includes("too many requests")) {
          errorMessage = "Demasiados intentos. Espera unos minutos antes de intentar de nuevo.";
        } else {
          errorMessage = sanitizeErrorMessage(error);
        }
        
        throw new Error(errorMessage);
      }

      // Clear failed attempts on successful login
      this.clearAttempts(sanitizedEmail);
      
      console.log("Secure sign in successful:", data.user?.email);
      toast.success("Sesión iniciada correctamente");
    } catch (error: any) {
      console.error("Secure sign in failed:", error);
      // Re-throw the error so it can be handled by the form
      throw error;
    }
  }

  async signUp(email: string, password: string, metadata?: any): Promise<void> {
    // Input validation
    if (!validateEmail(email)) {
      throw new Error('Por favor introduce una dirección de correo válida');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Requisitos de contraseña no cumplidos: ${passwordValidation.errors.join(', ')}`);
    }

    const sanitizedEmail = sanitizeInput(email, 254);
    const sanitizedMetadata = metadata ? {
      full_name: sanitizeInput(metadata.full_name || '', 100)
    } : undefined;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: sanitizedMetadata,
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        },
      });

      if (error) {
        let errorMessage = "Error al registrarse";
        
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email ya está registrado. Intenta iniciar sesión o usar otro email.";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "La contraseña no cumple con los requisitos de seguridad.";
        } else {
          errorMessage = sanitizeErrorMessage(error);
        }
        
        throw new Error(errorMessage);
      }

      console.log("Secure sign up successful:", data.user?.email);
      toast.success("Registro exitoso. Por favor verifica tu correo electrónico.");
    } catch (error: any) {
      console.error("Secure sign up failed:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(sanitizeErrorMessage(error));
      }

      // Clear any sensitive data from localStorage
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-tsrspstmwuxjqjnrymwm-auth-token');
        localStorage.removeItem(this.attemptKey);
      } catch (e) {
        console.warn("Could not clear auth tokens from localStorage");
      }

      console.log("Secure sign out successful");
      toast.success("Sesión cerrada correctamente");
      
      // Force redirect to prevent cached data access
      window.location.href = '/landing';
    } catch (error: any) {
      console.error("Secure sign out failed:", error);
      throw new Error(sanitizeErrorMessage(error));
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!validateEmail(email)) {
      throw new Error('Por favor introduce una dirección de correo válida');
    }

    const sanitizedEmail = sanitizeInput(email, 254);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        sanitizedEmail,
        {
          redirectTo: `${window.location.origin}/auth`,
        }
      );

      if (error) {
        throw new Error(sanitizeErrorMessage(error));
      }

      toast.success("Instrucciones de recuperación enviadas a tu email");
    } catch (error: any) {
      console.error("Secure password reset failed:", error);
      throw new Error(sanitizeErrorMessage(error));
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session validation failed:", error);
        return false;
      }

      return !!session;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
