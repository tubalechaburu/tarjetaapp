export interface AuthContextType {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  userRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export type UserRole = 'user' | 'admin' | 'superadmin' | null;

export interface CardLink {
  id?: string;
  title: string;
  url: string;
}

// Auth related types
export interface AuthFormValues {
  email: string;
  password: string;
  fullName?: string;
  acceptTerms?: boolean;
  rememberMe?: boolean;
}

export interface BusinessCard {
  id?: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  avatarUrl: string;
  logoUrl?: string; // Add logoUrl as an optional property
  createdAt?: number;
  userId?: string;
  links?: CardLink[];
}
