
import React from "react";
import QRCodeGenerator from "../QRCodeGenerator";

interface QRCodeTabProps {
  shareUrl: string;
  fullShareUrl: string;
  onShare: () => void;
}

const QRCodeTab: React.FC<QRCodeTabProps> = ({ 
  shareUrl, 
  fullShareUrl
}) => {
  return (
    <div className="space-y-4 mt-6">
      <QRCodeGenerator url={shareUrl} size={200} />
    </div>
  );
};

export default QRCodeTab;
