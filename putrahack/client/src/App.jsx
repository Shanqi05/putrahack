import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import AIChatbot from './components/ai/AIChatbot';
import Home from './pages/Home';
import DiseaseDetection from './pages/DiseaseDetection';
import Marketplace from './pages/Marketplace';
import Leftover from './pages/Leftover';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="font-sans">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/leftover" element={<Leftover />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <AIChatbot />
      </div>
    </Router>
  );
}

export default App;