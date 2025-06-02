
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, MoreHorizontal } from "lucide-react";

type DatabaseRole = 'user' | 'superadmin';

interface UserRoleActionsProps {
  currentRole: DatabaseRole;
  onRoleUpdate: (newRole: DatabaseRole) => void;
}

export const UserRoleActions = ({ currentRole, onRoleUpdate }: UserRoleActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Seleccionar rol</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onRoleUpdate('superadmin')}>
          Superadmin
          {currentRole === 'superadmin' && (
            <Check className="ml-auto h-4 w-4" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRoleUpdate('user')}>
          Usuario
          {currentRole === 'user' && (
            <Check className="ml-auto h-4 w-4" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
