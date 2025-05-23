
import React from "react";
import { CardLink } from "@/types";
import LinksForm from "@/components/LinksForm";

interface LinkManagerProps {
  links: CardLink[];
  setLinks: React.Dispatch<React.SetStateAction<CardLink[]>>;
}

const LinkManager: React.FC<LinkManagerProps> = ({ links, setLinks }) => {
  return <LinksForm links={links} setLinks={setLinks} />;
};

export default LinkManager;
