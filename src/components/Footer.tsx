
import React from "react";

const Footer = () => {
  return (
    <footer className="mt-10 py-4 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm text-muted-foreground text-center">
          <p>© {new Date().getFullYear()} TarjetaVisita.App by tubalechaburu.com</p>
          <span className="hidden md:inline mx-2">•</span>
          <span>Contacto: tubal@tubalechaburu.com</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
