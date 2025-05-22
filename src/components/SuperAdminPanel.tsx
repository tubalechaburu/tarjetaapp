
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminActions } from "@/components/admin/AdminActions";
import { UsersSection } from "@/components/admin/UsersSection";
import { toast } from "sonner";

export const SuperAdminPanel = () => {
  const [showUsers, setShowUsers] = useState(false);
  const { user, userRole } = useAuth();
  
  useEffect(() => {
    console.log("SuperAdminPanel - Current role:", userRole);
    console.log("SuperAdminPanel - User:", user);
    
    if (user && userRole !== 'superadmin') {
      toast.error(`Necesitas permisos de superadmin para acceder a este panel. Rol actual: ${userRole || 'no asignado'}`);
    }
  }, [user, userRole]);

  // No renderizar el panel si el usuario no está autenticado o no es superadmin
  if (!user || userRole !== 'superadmin') {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 mb-6 rounded">
      <AdminHeader />
      <AdminActions showUsers={showUsers} setShowUsers={setShowUsers} />
      <UsersSection visible={showUsers} />
    </div>
  );
};
