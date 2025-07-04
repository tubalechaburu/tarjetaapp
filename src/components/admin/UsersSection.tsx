
import { EnhancedUserTable } from "@/components/admin/EnhancedUserTable";

interface UsersSectionProps {
  visible: boolean;
}

export const UsersSection = ({ visible }: UsersSectionProps) => {
  if (!visible) return null;

  return (
    <div className="mt-4">
      <h3 className="text-md font-semibold mb-2">Usuarios registrados</h3>
      <EnhancedUserTable />
    </div>
  );
};
