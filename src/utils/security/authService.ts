import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateEmail, validatePassword, sanitizeInput, sanitizeErrorMessage } from "./validation";

/**
 * Interface para intentos de inicio de sesión
 */
interface SignInAttempt {
  timestamp: number;
  email: string;
}

/**
 * Servicio de autenticación seguro con protecciones contra ataques de fuerza bruta
 * y validación de entrada robusta
 * 
 * Características principales:
 * - Limitación de intentos de inicio de sesión
 * - Validación y sanitización de entradas
 * - Gestión segura de sesiones
 * - Mensajes de error seguros
 * 
 * @example
 * ```typescript
 * import { authService } from '@/utils/security/authService';
 * 
 * try {
 *   await authService.signIn(email, password);
 * } catch (error) {
 *   console.error('Error de autenticación:', error.message);
 * }
 * ```
 */
class AuthService {
  private maxAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutos
  private attemptKey = 'auth_attempts';

  /**
   * Obtiene los intentos de inicio de sesión almacenados localmente
   * @returns {SignInAttempt[]} Array de intentos de inicio de sesión
   * @private
   */
  private getAttempts(): SignInAttempt[] {
    try {
      const stored = localStorage.getItem(this.attemptKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Almacena los intentos de inicio de sesión en localStorage
   * @param {SignInAttempt[]} attempts - Array de intentos a almacenar
   * @private
   */
  private setAttempts(attempts: SignInAttempt[]): void {
    try {
      localStorage.setItem(this.attemptKey, JSON.stringify(attempts));
    } catch {
      // Fail silently if localStorage is not available
    }
  }

  /**
   * Verifica si una cuenta está bloqueada por demasiados intentos fallidos
   * @param {string} email - Email de la cuenta a verificar
   * @returns {boolean} True si la cuenta está bloqueada
   * @private
   */
  private isAccountLocked(email: string): boolean {
    const attempts = this.getAttempts();
    const recentAttempts = attempts.filter(
      attempt => 
        attempt.email === email && 
        Date.now() - attempt.timestamp < this.lockoutDuration
    );
    
    return recentAttempts.length >= this.maxAttempts;
  }

  /**
   * Registra un intento fallido de inicio de sesión
   * @param {string} email - Email del intento fallido
   * @private
   */
  private recordFailedAttempt(email: string): void {
    const attempts = this.getAttempts();
    attempts.push({ timestamp: Date.now(), email });
    
    // Keep only recent attempts to prevent storage bloat
    const recentAttempts = attempts.filter(
      attempt => Date.now() - attempt.timestamp < this.lockoutDuration
    );
    
    this.setAttempts(recentAttempts);
  }

  /**
   * Limpia los intentos fallidos para un email específico
   * @param {string} email - Email para limpiar intentos
   * @private
   */
  private clearAttempts(email: string): void {
    const attempts = this.getAttempts();
    const filteredAttempts = attempts.filter(attempt => attempt.email !== email);
    this.setAttempts(filteredAttempts);
  }

  /**
   * Inicia sesión de usuario con validaciones de seguridad
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @throws {Error} Si las credenciales son inválidas o la cuenta está bloqueada
   * 
   * @example
   * ```typescript
   * try {
   *   await authService.signIn('user@example.com', 'securePassword123');
   *   console.log('Inicio de sesión exitoso');
   * } catch (error) {
   *   console.error('Error:', error.message);
   * }
   * ```
   */
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

  /**
   * Registra un nuevo usuario con validaciones de seguridad mejoradas
   * 
   * @param {string} email - Email del nuevo usuario
   * @param {string} password - Contraseña del nuevo usuario
   * @param {any} metadata - Metadata adicional del usuario
   * @throws {Error} Si los datos son inválidos o el registro falla
   * 
   * @example
   * ```typescript
   * try {
   *   await authService.signUp('user@example.com', 'securePassword123', {
   *     full_name: 'Juan Pérez'
   *   });
   * } catch (error) {
   *   console.error('Error en registro:', error.message);
   * }
   * ```
   */
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
      // Use production domain for redirect
      const redirectUrl = `https://tarjetavisita.app/auth/confirm`;
      
      console.log("Attempting signup with production domain");
      console.log("Redirect URL:", redirectUrl);
      console.log("Email:", sanitizedEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: sanitizedMetadata,
          emailRedirectTo: redirectUrl,
          // Force email confirmation
          captchaToken: undefined
        },
      });

      if (error) {
        console.error("Signup error:", error);
        let errorMessage = "Error al registrarse";
        
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email ya está registrado. Intenta iniciar sesión o usar otro email.";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "La contraseña no cumple con los requisitos de seguridad.";
        } else if (error.message.includes("Email rate limit exceeded")) {
          errorMessage = "Demasiados emails enviados. Espera unos minutos antes de intentar de nuevo.";
        } else {
          errorMessage = sanitizeErrorMessage(error);
        }
        
        throw new Error(errorMessage);
      }

      console.log("Signup successful:", data);
      
      if (data.user && !data.session) {
        console.log("User created, email confirmation required");
        toast.success("¡Registro exitoso! Revisa tu email (incluyendo spam) para confirmar tu cuenta.");
      } else if (data.session) {
        console.log("User created and automatically logged in");
        toast.success("¡Registro exitoso! Ya puedes usar la aplicación.");
      }
      
      // Additional logging for debugging
      if (data.user) {
        console.log("User ID:", data.user.id);
        console.log("Email confirmed:", data.user.email_confirmed_at);
        console.log("User metadata:", data.user.user_metadata);
      }
      
    } catch (error: any) {
      console.error("Secure sign up failed:", error);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario actual y limpia datos sensibles
   * 
   * @throws {Error} Si el cierre de sesión falla
   * 
   * @example
   * ```typescript
   * try {
   *   await authService.signOut();
   * } catch (error) {
   *   console.error('Error al cerrar sesión:', error.message);
   * }
   * ```
   */
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

  /**
   * Envía un email de recuperación de contraseña
   * 
   * @param {string} email - Email del usuario
   * @throws {Error} Si el email es inválido o el envío falla
   */
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

  /**
   * Valida si la sesión actual es válida
   * 
   * @returns {Promise<boolean>} True si la sesión es válida
   * 
   * @example
   * ```typescript
   * const isValid = await authService.validateSession();
   * if (!isValid) {
   *   // Redirigir a login
   * }
   * ```
   */
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

/**
 * Instancia singleton del servicio de autenticación
 * @type {AuthService}
 */
export const authService = new AuthService();
