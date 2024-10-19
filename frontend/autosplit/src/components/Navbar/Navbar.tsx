// src/components/Navbar/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

const Navbar: React.FC = () => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          AutoSplit
        </Link>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
        <div className={`flex-col md:flex-row md:flex ${isOpen ? 'flex' : 'hidden'}`}>
          <Link to="/dashboard" className="mt-2 md:mt-0 md:ml-4 text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;