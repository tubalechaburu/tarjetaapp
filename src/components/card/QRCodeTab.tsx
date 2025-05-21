
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
    <div className="space-y-4">
      <QRCodeGenerator url={shareUrl} size={230} />
      
      <div className="p-4 bg-gray-100 rounded-md mt-4">
        <div className="text-center">
          <p className="text-sm">{fullShareUrl}</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <button 
          className="px-6 py-2 bg-gray-900 text-white rounded-md flex items-center justify-center gap-2"
          onClick={() => navigator.clipboard.writeText(fullShareUrl)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12C8 10.9 8.9 10 10 10C11.1 10 12 10.9 12 12C12 13.1 11.1 14 10 14C8.9 14 8 13.1 8 12ZM12 21L11 20C10.5 19.5 10.2 19.1 10 18.7C9.8 19.1 9.5 19.5 9 20L8 21H4V17L5 16C5.5 15.5 5.9 15.2 6.3 15C5.9 14.8 5.5 14.5 5 14L4 13V9H8L9 10C9.5 10.5 9.8 10.9 10 11.3C10.2 10.9 10.5 10.5 11 10L12 9H16V13L15 14C14.5 14.5 14.1 14.8 13.7 15C14.1 15.2 14.5 15.5 15 16L16 17V21H12Z" fill="currentColor"/>
          </svg>
          Compartir
        </button>
      </div>
    </div>
  );
};

export default QRCodeTab;
