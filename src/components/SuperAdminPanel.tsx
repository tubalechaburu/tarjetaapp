
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

interface SuperAdminPanelProps {
  isSuperAdmin: boolean;
}

export const SuperAdminPanel = ({ isSuperAdmin }: SuperAdminPanelProps) => {
  if (!isSuperAdmin) {
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
        <Button variant="outline" size="sm" className="gap-1">
          <User className="h-4 w-4" />
          Gestionar Usuarios
        </Button>
      </div>
    </div>
  );
};
