
import { BusinessCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteCard } from "@/utils/storage";

interface UserCardDisplayProps {
  userCard: BusinessCard;
  onCardDeleted: () => void;
}

export const UserCardDisplay = ({ userCard, onCardDeleted }: UserCardDisplayProps) => {
  const navigate = useNavigate();

  const handleDeleteCard = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar tu tarjeta?")) {
      try {
        await deleteCard(userCard.id!);
        onCardDeleted();
        toast.success("Tarjeta eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar la tarjeta:", error);
        toast.error("Error al eliminar la tarjeta");
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {userCard.avatarUrl ? (
                <AvatarImage src={userCard.avatarUrl} alt={userCard.name} />
              ) : (
                <AvatarFallback className="text-lg">
                  {getInitials(userCard.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-xl">{userCard.name}</CardTitle>
              {userCard.jobTitle && (
                <p className="text-muted-foreground">{userCard.jobTitle}</p>
              )}
              {userCard.company && (
                <p className="font-medium">{userCard.company}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${userCard.id}`)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteCard}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-3">Información Personal</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.email || '-'}</span>
                  {userCard.visibleFields?.email ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descripción:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.description || '-'}</span>
                  {userCard.visibleFields?.description ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre completo:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.name}</span>
                  {userCard.visibleFields?.name ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cargo:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.jobTitle || '-'}</span>
                  {userCard.visibleFields?.jobTitle ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empresa:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.company || '-'}</span>
                  {userCard.visibleFields?.company ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.phone || '-'}</span>
                  {userCard.visibleFields?.phone ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sitio web:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.website || '-'}</span>
                  {userCard.visibleFields?.website ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dirección:</span>
                <div className="flex items-center gap-2">
                  <span>{userCard.address || '-'}</span>
                  {userCard.visibleFields?.address ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Descripción profesional</h3>
            <div className="flex items-start gap-2">
              <p className="text-sm text-muted-foreground flex-1">
                {userCard.description || 'Sin descripción'}
              </p>
              {userCard.visibleFields?.description ? (
                <Eye className="h-3 w-3 text-green-600 mt-1" />
              ) : (
                <EyeOff className="h-3 w-3 text-gray-400 mt-1" />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button onClick={() => navigate(`/card/${userCard.id}`)}>
            Ver tarjeta
          </Button>
          <Button variant="outline" onClick={() => navigate(`/edit/${userCard.id}`)}>
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
