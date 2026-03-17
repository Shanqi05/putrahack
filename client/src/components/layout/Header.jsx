import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Leaf,
    User,
    ChevronDown,
    LogOut,
    AlertCircle,
    Bell,
    Inbox,
    LayoutDashboard,
    Stethoscope,
    Store,
    Recycle,
    Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext.js";

const NavItem = ({ title, items, path }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <Link
                to={path}
                className="flex items-center space-x-1 text-slate-700 hover:text-emerald-600 transition-all font-semibold px-4 py-2 rounded-xl hover:bg-emerald-50"
            >
                <span>{title}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </Link>
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
                            <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const Header = () => {
    const { isLoggedIn, logout, loading } = useAuth();
    const { notifications, unreadCount, markAllAsRead } = useNotification();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
        setShowLogoutConfirm(false);
    };

    const navStyles = isLoggedIn()
        ? "bg-emerald-50/90 border-emerald-200 shadow-emerald-500/20 shadow-lg"
        : "bg-white/70 border-white/40 shadow-lg";

    return (
        <nav
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl backdrop-blur-md border rounded-[2rem] z-[1000] px-6 py-3 flex items-center justify-between transition-all duration-500 ${navStyles}`}
        >
            <Link
                to={isLoggedIn() ? "/farmer-dashboard" : "/"}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
                <div className="bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#10B981] p-2 rounded-xl text-white shadow-md">
                    <Leaf size={24} fill="currentColor" />
                </div>
                <div className="flex items-center">
          <span className="text-2xl font-black bg-gradient-to-r from-[#064E3B] via-[#065F46] to-[#10B981] bg-clip-text text-transparent tracking-tighter">
            TripleGain
          </span>
                    {isLoggedIn() && (
                        <span className="ml-3 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-[10px] font-black text-emerald-700 tracking-widest uppercase hidden md:flex items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Farmer Portal
            </span>
                    )}
                </div>
            </Link>

            {!loading && (
                <div className="hidden lg:flex items-center space-x-1">
                    {!isLoggedIn() && (
                        <>
                            <Link
                                to="/"
                                className="text-slate-700 hover:text-emerald-600 transition-all font-semibold px-4 py-2 rounded-xl hover:bg-emerald-50"
                            >
                                Home
                            </Link>
                            <NavItem
                                title="Disease Detection"
                                path="/disease-detection"
                                items={[{ label: "Scan Crops", desc: "AI-powered detection", path: "/disease-detection" }]}
                            />
                            <NavItem
                                title="Marketplace"
                                path="/marketplace"
                                items={[{ label: "Buy Fresh Crops", desc: "Direct from farmers", path: "/marketplace" }]}
                            />
                            <NavItem
                                title="Leftover"
                                path="/leftover"
                                items={[{ label: "Find Surplus", desc: "Discounted products", path: "/leftover" }]}
                            />
                        </>
                    )}

                    {isLoggedIn() && (
                        <>
                            <Link
                                to="/farmer-dashboard"
                                className="flex items-center space-x-1.5 text-emerald-800 hover:bg-emerald-100/50 hover:text-emerald-600 font-bold px-4 py-2 rounded-xl"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/disease-detection"
                                className="flex items-center space-x-1.5 text-emerald-800 hover:bg-emerald-100/50 hover:text-emerald-600 font-bold px-4 py-2 rounded-xl"
                            >
                                <Stethoscope size={18} />
                                <span>Disease Detection</span>
                            </Link>
                            <Link
                                to="/marketplace"
                                className="flex items-center space-x-1.5 text-emerald-800 hover:bg-emerald-100/50 hover:text-emerald-600 font-bold px-4 py-2 rounded-xl"
                            >
                                <Store size={18} />
                                <span>Marketplace</span>
                            </Link>
                            <Link
                                to="/leftover"
                                className="flex items-center space-x-1.5 text-emerald-800 hover:bg-emerald-100/50 hover:text-emerald-600 font-bold px-4 py-2 rounded-xl"
                            >
                                <Recycle size={18} />
                                <span>Leftover</span>
                            </Link>
                        </>
                    )}
                </div>
            )}

            <div className="flex items-center space-x-3">
                {loading ? (
                    <div className="h-10 w-10 rounded-full bg-emerald-100 animate-pulse" />
                ) : isLoggedIn() ? (
                    <div className="flex items-center gap-4 relative">
                        {/* Notification & Inbox */}
                        <div className="hidden md:flex items-center space-x-3 border-r border-emerald-300/50 pr-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                                    className="text-emerald-700 hover:text-emerald-500 transition-colors relative bg-white/50 p-2 rounded-full hover:bg-white/80"
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                    )}
                                </button>

                                {/* Notification Dropdown Menu */}
                                {showNotifMenu && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                            <span className="font-bold text-gray-800">Notifications</span>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center"
                                                >
                                                    <Check size={12} className="mr-1" /> Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-gray-400 font-medium">No new notifications</div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        className={`p-4 border-b border-gray-50 last:border-0 ${n.read ? "opacity-60" : "bg-emerald-50/30"}`}
                                                    >
                                                        <p className="font-bold text-sm text-gray-800">{n.title}</p>
                                                        <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{n.time.toLocaleTimeString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="text-emerald-700 hover:text-emerald-500 transition-colors bg-white/50 p-2 rounded-full hover:bg-white/80">
                                <Inbox size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/profile"
                                className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 p-[2px] hover:shadow-lg"
                            >
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-emerald-600">
                                    <User size={20} />
                                </div>
                            </Link>
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="text-emerald-700 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="text-slate-700 hover:text-emerald-600 font-semibold px-4 py-2">
                            Login
                        </Link>
                        <Link to="/signup" className="bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow-md">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-[90%]">
                        <h2 className="text-2xl font-bold mb-4">Confirm Logout</h2>
                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={() => setShowLogoutConfirm(false)} className="px-6 py-2 bg-slate-100 rounded-xl">
                                Cancel
                            </button>
                            <button onClick={handleLogout} className="px-6 py-2 bg-red-500 text-white rounded-xl">
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
