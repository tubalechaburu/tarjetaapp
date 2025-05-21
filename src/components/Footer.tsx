
import React from "react";
import { Mail, Link } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-10 py-4 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm text-muted-foreground text-center">
          <p>© {new Date().getFullYear()} by</p>
          <a 
            href="https://tubalechaburu.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <Link className="h-4 w-4" />
            tubalechaburu.com
          </a>
          <span className="hidden md:inline mx-2">•</span>
          <a 
            href="mailto:contacto@tubalechaburu.com" 
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <Mail className="h-4 w-4" />
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
