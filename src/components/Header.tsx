
import { Link } from "react-router-dom";
import { LogOut, Plus, User, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  console.log("Header rendered - Current user role:", userRole);
  console.log("User info:", user);

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Mis Tarjetas Digitales</h1>
      <div className="flex gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Button variant="ghost" className="h-8 p-1 flex items-center gap-2 rounded-full relative">
                  <Avatar className="h-8 w-8">
                    {user.user_metadata?.avatar_url ? (
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
                    ) : (
                      <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  {userRole && (
                    <Badge variant={getRoleBadgeVariant(userRole)} className="h-5">
                      <Shield className="h-3 w-3 mr-1" />
                      {userRole}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Mi cuenta</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                </Link>
                {userRole === 'superadmin' && (
                  <>
                    <DropdownMenuSeparator />
                    <Link to="/admin">
                      <DropdownMenuItem>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Panel de Administración</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link to="/auth">
            <Button variant="outline" className="gap-1">
              <User className="h-4 w-4" />
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
