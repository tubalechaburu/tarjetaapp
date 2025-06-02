
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface UserTableHeaderProps {
  userCount: number;
  onExportAll: () => void;
}

export const UserTableHeader = ({ userCount, onExportAll }: UserTableHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Usuarios registrados ({userCount})</h3>
      <Button onClick={onExportAll} variant="outline" className="gap-1">
        <Download className="h-4 w-4" />
        Exportar todos
      </Button>
    </div>
  );
};
