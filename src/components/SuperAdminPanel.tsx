
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminActions } from "@/components/admin/AdminActions";
import { UsersSection } from "@/components/admin/UsersSection";

export const SuperAdminPanel = () => {
  const [showUsers, setShowUsers] = useState(false);
  const { userRole } = useAuth();

  // Verificar explícitamente si el rol es superadmin
  if (userRole !== 'superadmin') {
    console.log("No es superadmin, rol actual:", userRole);
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
