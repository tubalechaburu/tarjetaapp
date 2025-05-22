
import { Button } from "@/components/ui/button";
import { User, ChevronDown, ChevronUp } from "lucide-react";

interface AdminActionsProps {
  showUsers: boolean;
  setShowUsers: (show: boolean) => void;
}

export const AdminActions = ({ showUsers, setShowUsers }: AdminActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-4">
      <Button 
        variant={showUsers ? "default" : "outline"}
        size="sm" 
        className="gap-1"
        onClick={() => setShowUsers(!showUsers)}
      >
        <User className="h-4 w-4" />
        Gestionar Usuarios
        {showUsers ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>
    </div>
  );
};
