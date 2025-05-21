
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
}

export interface SupabaseBusinessCard {
  id: string;
  name: string;
  title: string | null; // Esto corresponde a jobTitle en nuestra interfaz
  email: string | null;
  phone: string | null;
  photo?: string | null; // Esto corresponde a avatarUrl en nuestra interfaz
  created_at: string;
  updated_at: string;
  user_id: string;
  links: any; // Cambiado de any[] a any para que coincida con el tipo Json de Supabase
  theme: {
    text: string;
    accent: string;
    background: string;
  };
}
