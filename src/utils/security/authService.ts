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
      throw new Error('Please enter a valid email address');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check for account lockout
    if (this.isAccountLocked(email)) {
      throw new Error('Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
    }

    const sanitizedEmail = sanitizeInput(email, 254);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        this.recordFailedAttempt(sanitizedEmail);
        throw new Error(sanitizeErrorMessage(error));
      }

      // Clear failed attempts on successful login
      this.clearAttempts(sanitizedEmail);
      
      console.log("Secure sign in successful:", data.user?.email);
      toast.success("Signed in successfully");
    } catch (error: any) {
      console.error("Secure sign in failed:", error);
      throw new Error(sanitizeErrorMessage(error));
    }
  }

  async signUp(email: string, password: string, metadata?: any): Promise<void> {
    // Input validation
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
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
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });

      if (error) {
        throw new Error(sanitizeErrorMessage(error));
      }

      console.log("Secure sign up successful:", data.user?.email);
      toast.success("Registration successful. Please verify your email address.");
    } catch (error: any) {
      console.error("Secure sign up failed:", error);
      throw new Error(sanitizeErrorMessage(error));
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
        localStorage.removeItem(`sb-${supabase.supabaseUrl.split('//')[1]}-auth-token`);
        localStorage.removeItem(this.attemptKey);
      } catch (e) {
        console.warn("Could not clear auth tokens from localStorage");
      }

      console.log("Secure sign out successful");
      toast.success("Signed out successfully");
      
      // Force redirect to prevent cached data access
      window.location.href = '/landing';
    } catch (error: any) {
      console.error("Secure sign out failed:", error);
      throw new Error(sanitizeErrorMessage(error));
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
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

      toast.success("Password reset instructions sent to your email");
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
