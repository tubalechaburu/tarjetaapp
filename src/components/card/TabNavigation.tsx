
import React from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface TabNavigationProps {
  activeTab: "preview" | "qrcode";
  setActiveTab: (tab: "preview" | "qrcode") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <div className="flex justify-center gap-2 mb-6">
      <Button
        variant={activeTab === "preview" ? "default" : "outline"}
        onClick={() => setActiveTab("preview")}
        className="w-1/2"
      >
        Vista previa
      </Button>
      <Button
        variant={activeTab === "qrcode" ? "default" : "outline"}
        onClick={() => setActiveTab("qrcode")}
        className="w-1/2 gap-1"
      >
        <QrCode className="h-4 w-4" />
        Código QR
      </Button>
    </div>
  );
};

export default TabNavigation;
