import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, ChevronDown, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Refined NavItem: The main title is now a Link
const NavItem = ({ title, items, path }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Clicking the Nav Title now navigates to the page */}
      <Link 
        to={path} 
        className="flex items-center space-x-1 text-slate-700 hover:text-emerald-600 transition-all font-semibold px-4 py-2 rounded-xl hover:bg-emerald-50"
      >
        <span>{title}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Link>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 bg-white/95 backdrop-blur-xl border border-emerald-100 shadow-2xl rounded-2xl py-3 z-[100] animate-in fade-in slide-in-from-top-2">
          {items.map((item, idx) => (
            <Link 
              key={idx} 
              to={item.path} 
              className="block px-4 py-3 hover:bg-emerald-500/10 transition-colors group/item"
            >
              <span className="block font-bold text-slate-800 group-hover/item:text-emerald-700 text-sm">
                {item.label}
              </span>
              <p className="text-xs text-slate-400 font-medium">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { isLoggedIn, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-[2rem] z-[1000] px-6 py-3 flex items-center justify-between">
      
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-md">
          <Leaf size={24} fill="currentColor" />
        </div>
        <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent tracking-tighter">
          TripleGain
        </span>
      </Link>

      {/* Navigation Links - Only show when logged in */}
      {!loading && isLoggedIn() && (
        <div className="hidden lg:flex items-center space-x-1">
          <Link 
            to="/" 
            className="text-slate-700 hover:text-emerald-600 transition-all font-semibold px-4 py-2 rounded-xl hover:bg-emerald-50"
          >
            Home
          </Link>

          <NavItem 
            title="Disease Detection"
            path="/disease-detection"
            items={[
              { label: 'Scan Crops', desc: 'AI-powered disease detection', path: '/disease-detection' },
              { label: 'Results History', desc: 'View past diagnoses', path: '/disease-detection' }
            ]} 
          />

          <NavItem 
            title="Marketplace"
            path="/marketplace"
            items={[
              { label: 'Buy Fresh Crops', desc: 'Direct from farmers', path: '/marketplace' },
              { label: 'Sell Your Harvest', desc: 'List your crops', path: '/marketplace' }
            ]} 
          />

          <NavItem 
            title="Leftover"
            path="/leftover"
            items={[
              { label: 'Find Surplus', desc: 'Discounted products', path: '/leftover' },
              { label: 'List Leftover', desc: 'Sell extra crops', path: '/leftover' }
            ]} 
          />
        </div>
      )}

      {/* User Actions */}
      <div className="flex items-center space-x-3">
        {loading ? (
          <div className="h-10 w-10 rounded-full bg-emerald-100 animate-pulse" />
        ) : isLoggedIn() ? (
          <div className="flex items-center gap-3">
            <Link 
              to="/profile" 
              className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 p-[2px] hover:shadow-lg transition-all"
            >
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-emerald-600">
                <User size={20} />
              </div>
            </Link>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-slate-500 hover:text-red-600 transition-colors p-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              to="/login" 
              className="text-slate-700 hover:text-emerald-600 font-semibold px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-emerald-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-[90%] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Confirm Logout</h2>
            </div>
            
            <p className="text-slate-600 mb-6">
              Are you sure you want to logout? You'll need to login again to access your account.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all shadow-lg shadow-red-200"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;