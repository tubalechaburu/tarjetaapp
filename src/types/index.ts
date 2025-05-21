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
  links: { type: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  theme: {
    text: string;
    accent: string;
    background: string;
  };
}
