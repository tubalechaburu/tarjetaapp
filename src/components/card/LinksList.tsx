
import React from "react";
import { CardLink } from "@/types";
import LinkItem from "./LinkItem";
import EmptyLinksMessage from "./EmptyLinksMessage";

interface LinksListProps {
  links: CardLink[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof CardLink, value: string) => void;
}

const LinksList: React.FC<LinksListProps> = ({ links, onRemove, onUpdate }) => {
  if (links.length === 0) {
    return <EmptyLinksMessage />;
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <LinkItem
          key={link.id}
          link={link}
          index={index}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default LinksList;
