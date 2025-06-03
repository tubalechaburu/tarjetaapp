import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UsersManagementTable } from "@/components/admin/UsersManagementTable";
import { toast } from "sonner";
import Header from "@/components/Header";

const Admin = () => {
  const { user, userRole } = useAuth();
  
  useEffect(() => {
    console.log("AdminPage - Current role:", userRole);
    console.log("AdminPage - User:", user);
    
    if (user && userRole !== 'superadmin') {
      toast.error(`Necesitas permisos de superadmin para acceder a este panel. Rol actual: ${userRole || 'no asignado'}`);
    }
  }, [user, userRole]);

  // Si el usuario no está autenticado o no es superadmin, redirigir a inicio
  if (!user || userRole !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
        <AdminHeader />
        
        <div className="mt-6">
          <UsersManagementTable />
        </div>
      </div>
    </div>
  );
};

export default Admin;
