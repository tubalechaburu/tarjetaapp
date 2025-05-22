
import { Header } from "@/components/Header";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";

const Settings = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Configuración</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Aquí podrás cambiar las preferencias de tu cuenta.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Preferencias de Tarjetas</h3>
            <p className="text-gray-500 dark:text-gray-400 italic">
              (Configuraciones de tarjetas estarán disponibles próximamente)
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Notificaciones</h3>
            <p className="text-gray-500 dark:text-gray-400 italic">
              (Configuración de notificaciones estará disponible próximamente)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
