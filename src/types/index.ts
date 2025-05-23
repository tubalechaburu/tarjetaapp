
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
  // Add missing properties
  type: 'website' | 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'calendar' | 'other';
  label?: string;
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
  description?: string;
  avatarUrl: string;
  logoUrl?: string;
  createdAt?: number;
  userId?: string;
  links?: CardLink[];
  themeColors?: string[]; // Array de colores personalizados
  visibleFields?: Record<string, boolean>; // Control de campos visibles
}

// Add the SupabaseBusinessCard interface for Supabase data mapping
export interface SupabaseBusinessCard {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  photo: string;
  description?: string;
  created_at: string;
  user_id: string;
  links?: {
    id?: string;
    type?: string;
    url?: string;
    label?: string;
  }[];
  visible_fields?: Record<string, boolean>;
}
