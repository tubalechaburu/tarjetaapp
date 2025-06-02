
interface ConnectionStatusProps {
  connectionStatus: boolean | null;
}

export const ConnectionStatus = ({ connectionStatus }: ConnectionStatusProps) => {
  if (connectionStatus === false) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
        <p className="font-medium">
          ⚠️ No se pudo conectar con Supabase. Las tarjetas se guardarán localmente.
        </p>
        <p className="text-sm mt-1">
          Verifica tu conexión a internet y la configuración de Supabase.
        </p>
      </div>
    );
  }
  
  if (connectionStatus === true) {
    return (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-6 rounded">
        <p className="text-sm">
          ✅ Conectado - Los datos se sincronizan en tiempo real
        </p>
      </div>
    );
  }
  
  return null;
};
