
// Definición de un enlace en la tarjeta
export interface CardLink {
  id: string;
  type: "website" | "linkedin" | "facebook" | "twitter" | "instagram" | "calendar" | "whatsapp" | "other";
  label?: string;
  url: string;
}

// Extend the BusinessCard type to include company field
export interface BusinessCard {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: number;
  userId?: string;
  links?: CardLink[];
}

// Interface for cards from Supabase
export interface SupabaseBusinessCard {
  id: string;
  name: string;
  title: string | null;
  company?: string | null;
  email: string | null;
  phone: string | null;
  photo: string | null;
  links: Array<{ type: string; url: string; label?: string; id?: string }> | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  theme: {
    text: string;
    accent: string;
    background: string;
  };
}

// Tipo para el contexto de autenticación
export interface AuthContextType {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
