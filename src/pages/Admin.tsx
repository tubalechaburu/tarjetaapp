
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UsersManagementTable } from "@/components/admin/UsersManagementTable";
import { AllUsersTable } from "@/components/admin/AllUsersTable";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        
        <Tabs defaultValue="all-users" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-users">Todos los Usuarios</TabsTrigger>
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-users" className="mt-6">
            <AllUsersTable />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UsersManagementTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
