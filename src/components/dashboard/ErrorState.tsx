
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  connectionStatus: boolean | null;
}

export const ErrorState = ({ error, connectionStatus }: ErrorStateProps) => {
  return (
    <div className="text-center py-20">
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={() => window.location.reload()} className="mb-2">
        Reintentar
      </Button>
      <p className="text-sm text-gray-500">
        Estado de conexión a Supabase: {connectionStatus ? "✅ Conectado" : "❌ Desconectado"}
      </p>
    </div>
  );
};
