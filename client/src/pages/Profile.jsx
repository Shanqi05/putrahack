import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, LogOut, Camera, Edit2, Save, CheckCircle, Award, TrendingUp, Package } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!auth.currentUser) {
                    navigate('/login');
                    return;
                }

                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                    setFormData(userDoc.data());
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), formData);
            setUserData(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return <div className="min-h-screen pt-24 bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
            <div className="text-emerald-600 font-bold text-lg">Loading...</div>
        </div>;
    }

    if (!userData) {
        return <div className="min-h-screen pt-24 bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
            <div className="text-emerald-600 font-bold text-lg">No user data found</div>
        </div>;
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-green-50">
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <div className="relative z-10 flex items-center gap-6 md:gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`}
                                alt={userData.fullName}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white"
                            />
                            <button className="absolute bottom-0 right-0 bg-white text-emerald-600 p-2 rounded-xl hover:scale-110 transition-transform">
                                <Camera size={20} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-black mb-2">{userData.fullName}</h1>
                            <p className="text-green-100 font-semibold capitalize mb-4 inline-block bg-white/20 px-4 py-1 rounded-full">
                                {userData.role === 'farmer' ? '🌱 Farmer' : '🛒 Buyer'}
                            </p>
                            <p className="text-green-100 flex items-center gap-2">
                                <MapPin size={18} /> {userData.location}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-3xl font-black">12</p>
                                <p className="text-xs text-green-100 font-semibold">Listings</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-3xl font-black">4.8</p>
                                <p className="text-xs text-green-100 font-semibold">Rating</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <p className="text-3xl font-black">324</p>
                                <p className="text-xs text-green-100 font-semibold">Followers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-6">
                            <h3 className="text-lg font-black text-emerald-900 mb-4 flex items-center gap-2">
                                <Award size={20} /> Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform">
                                    {userData.role === 'farmer' ? 'Create Listing' : 'Browse Products'}
                                </button>
                                <button className="w-full bg-white border-2 border-emerald-300 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors">
                                    View Orders
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-6">
                            <h3 className="text-lg font-black text-emerald-900 mb-4 flex items-center gap-2">
                                <TrendingUp size={20} /> Statistics
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-emerald-700 font-semibold text-sm mb-2">Total Sales</p>
                                    <p className="text-3xl font-black text-emerald-600">₹45,230</p>
                                </div>
                                <div>
                                    <p className="text-emerald-700 font-semibold text-sm mb-2">Completed Orders</p>
                                    <p className="text-3xl font-black text-green-600">58</p>
                                </div>
                                <div>
                                    <p className="text-emerald-700 font-semibold text-sm mb-2">Response Time</p>
                                    <p className="text-3xl font-black text-emerald-600">&lt;2h</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Profile Edit */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-emerald-900">Profile Information</h2>
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-bold"
                            >
                                {isEditing ? (
                                    <><Save size={18} /> Save Changes</>
                                ) : (
                                    <><Edit2 size={18} /> Edit Profile</>
                                )}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                    <User size={18} className="text-emerald-600" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 disabled:bg-emerald-50 disabled:cursor-not-allowed outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                    <Mail size={18} className="text-emerald-600" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 cursor-not-allowed text-emerald-700"
                                />
                                <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                    <Phone size={18} className="text-emerald-600" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 disabled:bg-emerald-50 disabled:cursor-not-allowed outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                    <MapPin size={18} className="text-emerald-600" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 disabled:bg-emerald-50 disabled:cursor-not-allowed outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-emerald-900 font-bold mb-2">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 disabled:bg-emerald-50 disabled:cursor-not-allowed outline-none focus:border-emerald-500 transition-all resize-none h-24"
                                />
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-50 border-2 border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 mt-8"
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
