
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import { UserCardsSection } from "@/components/admin/UserCardsSection";
import { UserRoleActions } from "@/components/admin/UserRoleActions";

type DatabaseRole = 'user' | 'superadmin';

interface User {
  id: string;
  full_name?: string;
  email: string;
  role: DatabaseRole;
}

interface UserTableRowProps {
  user: User;
  onRoleUpdate: (userId: string, newRole: DatabaseRole) => void;
}

export const UserTableRow = ({ user, onRoleUpdate }: UserTableRowProps) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const handleRoleUpdate = (newRole: DatabaseRole) => {
    onRoleUpdate(user.id, newRole);
  };

  const toggleExpanded = () => {
    setExpandedUser(expandedUser === user.id ? null : user.id);
  };

  return (
    <>
      <TableRow key={user.id}>
        <TableCell>{user.full_name || "Sin nombre"}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
        <TableCell className="text-right">
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="gap-1"
            >
              {expandedUser === user.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Ver tarjetas
            </Button>
            
            <Link to={`/profile`} target="_blank">
              <Button variant="ghost" size="sm" className="gap-1">
                <User className="h-4 w-4" />
                Perfil
              </Button>
            </Link>

            <UserRoleActions 
              currentRole={user.role}
              onRoleUpdate={handleRoleUpdate}
            />
          </div>
        </TableCell>
      </TableRow>
      {expandedUser === user.id && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/30">
            <UserCardsSection userId={user.id} userEmail={user.email} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
