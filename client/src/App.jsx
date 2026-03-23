import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatbot from './components/ai/AIChatbotFixed';
import Home from './pages/Home';
import DiseaseDetection from './pages/DiseaseDetection';
import DiseaseHistory from './pages/DiseaseHistory';
import Marketplace from './pages/Marketplace';
import Leftover from './pages/Leftover';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import FarmerDashboard from './pages/FarmerDashboard';
import { NotificationProvider } from './context/NotificationContext.js';
import Inbox from "./pages/Inbox";

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <div className="font-sans">
                        <Header />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
                            <Route path="/disease-history" element={<ProtectedRoute><DiseaseHistory /></ProtectedRoute>} />
                            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                            <Route path="/leftover" element={<ProtectedRoute><Leftover /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                            <Route path="/inbox" element={<Inbox />} />
                        </Routes>
                        <AIChatbot />
                    </div>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
