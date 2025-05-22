
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User, ChevronDown, ChevronUp } from "lucide-react";
import { UsersTable } from "@/components/admin/UsersTable";
import { useAuth } from "@/providers/AuthProvider";

export const SuperAdminPanel = () => {
  const [showUsers, setShowUsers] = useState(false);
  const { isSuperAdmin } = useAuth();

  // Si no es superadmin, no mostramos el panel
  if (!isSuperAdmin()) {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 mb-6 rounded">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Shield className="h-5 w-5 text-red-500" />
        Panel de Superadmin
      </h2>
      <p className="text-sm text-muted-foreground mb-2">
        Tienes acceso completo como superadministrador del sistema.
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShowUsers(!showUsers)}
        >
          <User className="h-4 w-4" />
          Gestionar Usuarios
          {showUsers ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>
      </div>

      {showUsers && (
        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">Usuarios registrados</h3>
          <UsersTable />
        </div>
      )}
    </div>
  );
};
