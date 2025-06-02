
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SuperAdminUsersTable } from "@/components/admin/SuperAdminUsersTable";
import { toast } from "sonner";

export const SuperAdminPanel = () => {
  const { user, userRole } = useAuth();
  
  useEffect(() => {
    console.log("SuperAdminPanel - Current role:", userRole);
    console.log("SuperAdminPanel - User:", user);
    
    // Verificar si es el email específico de superadmin o tiene el rol correcto
    const isSuperAdminUser = user?.email === 'tubal@tubalechaburu.com' || userRole === 'superadmin';
    
    if (user && !isSuperAdminUser) {
      toast.error(`Necesitas permisos de superadmin para acceder a este panel. Rol actual: ${userRole || 'no asignado'}`);
    }
  }, [user, userRole]);

  // Permitir acceso si es el email específico o tiene rol superadmin
  const canAccess = user?.email === 'tubal@tubalechaburu.com' || userRole === 'superadmin';

  // No renderizar el panel si el usuario no está autenticado o no puede acceder
  if (!user || !canAccess) {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-6 rounded-lg">
      <AdminHeader />
      <div className="mt-6">
        <SuperAdminUsersTable />
      </div>
    </div>
  );
};
