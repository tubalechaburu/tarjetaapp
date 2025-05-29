
import { UserRole } from "@/types";

export const isAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'admin' || userRole === 'superadmin';
};

export const isSuperAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'superadmin';
};
