
import { BusinessCard, UserRole } from "@/types";

export interface UserWithCards {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  cards: BusinessCard[];
  updated_at: string;
}
