
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
  return (
    <Card className="flex flex-col items-center p-4 bg-white">
      <CardContent className="pt-4">
        <QRCodeSVG value={url} size={size} />
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
