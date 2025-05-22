
import { Shield } from "lucide-react";

export const AdminHeader = () => {
  return (
    <div>
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Shield className="h-5 w-5 text-red-500" />
        Panel de Superadmin
      </h2>
      <p className="text-sm text-muted-foreground mb-2">
        Tienes acceso completo como superadministrador del sistema.
      </p>
    </div>
  );
};
