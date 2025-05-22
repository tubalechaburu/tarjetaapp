
import { Header } from "@/components/Header";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Perfil de Usuario</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Aquí podrás gestionar tu información personal.
        </p>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <p className="p-2 bg-gray-100 dark:bg-gray-700 rounded">{user.email}</p>
          </div>
          {user.user_metadata?.full_name && (
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <p className="p-2 bg-gray-100 dark:bg-gray-700 rounded">{user.user_metadata.full_name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
