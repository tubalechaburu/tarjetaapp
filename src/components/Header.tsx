
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              🎴
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TarjetaVisita</h1>
              <p className="text-xs text-gray-500">Tu tarjeta digital profesional</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
