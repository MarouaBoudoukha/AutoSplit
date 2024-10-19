// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalState';
import { toast } from 'react-toastify';

const Home: React.FC = () => {
  const { account } = useGlobalContext();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (account) {
      navigate('/dashboard');
    } else {
      toast.error('Please connect your wallet to get started.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-6">Welcome to AutoSplit</h1>
      <p className="text-lg mb-8 text-center">
        Simplify your group expense management with blockchain technology.
      </p>
      <button
        onClick={handleGetStarted}
        className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-200"
      >
        Connect with your email
      </button>
    </div>
  );
};

export default Home;
