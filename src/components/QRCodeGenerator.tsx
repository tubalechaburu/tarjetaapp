
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  url, 
  size = 200 
}) => {
  // Ensure URL is absolute with the current origin
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  
  return (
    <Card className="flex flex-col items-center p-4 bg-white">
      <CardContent className="pt-4">
        <QRCodeSVG value={fullUrl} size={size} />
        <p className="mt-2 text-xs text-center text-gray-500 break-all">{fullUrl}</p>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
