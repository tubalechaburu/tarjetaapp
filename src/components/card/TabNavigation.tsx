import React from "react";
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: "preview";
  setActiveTab: (tab: "preview") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = () => {
  // This component is now empty since we don't need tabs anymore
  // We're just keeping it for backward compatibility
  return <></>;
};

export default TabNavigation;
