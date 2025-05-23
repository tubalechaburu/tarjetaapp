
import React from "react";
import { BusinessCard } from "@/types";

interface UserCardInfoProps {
  userCard: BusinessCard;
}

const UserCardInfo: React.FC<UserCardInfoProps> = ({ userCard }) => {
  return (
    <div className="mt-4 p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground">
        Los datos mostrados se sincronizan con tu tarjeta digital: <strong>{userCard.name}</strong>
      </p>
      {userCard.links && userCard.links.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">Enlaces adicionales:</p>
          <ul className="text-xs space-y-1">
            {userCard.links.map((link, index) => (
              <li key={index} className="flex justify-between">
                <span>{link.label || link.type}:</span>
                <span className="truncate max-w-48">{link.url}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserCardInfo;
