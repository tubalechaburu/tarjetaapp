
import React from "react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessCard } from "@/types";

interface ProfileHeaderProps {
  userCard: BusinessCard | null;
  editing: boolean;
  saving?: boolean;
  onEditToggle: () => void;
  onSave: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userCard,
  editing,
  saving = false,
  onEditToggle,
  onSave,
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Información Personal</CardTitle>
      <div className="flex gap-2">
        {userCard && (
          <Button 
            variant="outline" 
            onClick={() => window.open(`/card/${userCard.id}`, '_blank')}
          >
            Ver tarjeta
          </Button>
        )}
        <Button 
          variant={editing ? "default" : "outline"} 
          onClick={editing ? onSave : onEditToggle}
          disabled={saving}
        >
          {saving ? "Guardando..." : editing ? "Guardar" : "Editar"}
        </Button>
      </div>
    </CardHeader>
  );
};

export default ProfileHeader;
