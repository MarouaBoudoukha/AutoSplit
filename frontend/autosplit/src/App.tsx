// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Group from './pages/Group';
import CreateGroup from './pages/CreateGroup';
import Navbar from './components/Navbar/Navbar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/group/:id" element={<Group/>} />
          <Route path="/create-group" element={<CreateGroup />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}


export default App;
