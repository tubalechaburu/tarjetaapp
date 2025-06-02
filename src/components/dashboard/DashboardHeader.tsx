
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  userRole: string | null;
  hasUserCard: boolean;
  isSuperAdmin: boolean;
}

export const DashboardHeader = ({ userRole, hasUserCard, isSuperAdmin }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-2">
        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {userRole || 'user'}
        </span>
        {(!hasUserCard || isSuperAdmin) && (
          <Button onClick={() => navigate('/create')} className="gap-1">
            <Plus className="h-4 w-4" />
            Crear tarjeta
          </Button>
        )}
      </div>
    </div>
  );
};
