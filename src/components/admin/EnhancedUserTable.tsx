
import { useState } from 'react';
import { UsersTable } from "@/components/admin/UsersTable";
import { UserCardsSection } from "@/components/admin/UserCardsSection";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export const EnhancedUserTable = () => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  // Custom handler to be passed to the UsersTable component
  const handleUserRowClick = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };
  
  return (
    <div>
      <UsersTable />
      {expandedUser && (
        <div className="ml-8 border-l-2 border-primary/20 pl-4 py-2 mt-2 mb-4">
          <UserCardsSection userId={expandedUser} />
        </div>
      )}
    </div>
  );
};
