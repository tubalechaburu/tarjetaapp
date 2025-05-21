
import { Link } from "react-router-dom";
import { LogIn, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";

export const Header = () => {
  const { user, signOut, userRole } = useAuth();

  // Función para obtener el color del badge según el rol
  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Mis Tarjetas Digitales</h1>
      <div className="flex gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {userRole && (
                      <Badge variant={getRoleBadgeVariant(userRole)} className="h-5 ml-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {userRole}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.email}</p>
                  {userRole && <p className="text-xs mt-1 font-semibold">Rol: {userRole}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <Link to="/auth">
            <Button variant="outline" className="gap-1">
              <LogIn className="h-4 w-4" />
              Acceder
            </Button>
          </Link>
        )}
        <Link to="/create">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Crear tarjeta
          </Button>
        </Link>
      </div>
    </div>
  );
};
