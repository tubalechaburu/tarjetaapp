
interface ConnectionStatusProps {
  connectionStatus: boolean | null;
}

export const ConnectionStatus = ({ connectionStatus }: ConnectionStatusProps) => {
  if (connectionStatus === false) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
        <p>
          No se pudo conectar con Supabase. Las tarjetas se guardarán localmente.
        </p>
      </div>
    );
  }
  
  return null;
};
