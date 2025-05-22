
import { Loader2 } from "lucide-react";

export const LoadingUsers = () => (
  <div className="flex justify-center items-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Cargando usuarios...</span>
  </div>
);
