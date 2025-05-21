
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
  title: string; // Esto corresponde a jobTitle en nuestra interfaz
  email: string;
  phone: string;
  photo?: string; // Esto corresponde a avatarUrl en nuestra interfaz
  created_at: string;
  updated_at: string;
  user_id: string;
  links: any[];
  theme: {
    text: string;
    accent: string;
    background: string;
  };
}
