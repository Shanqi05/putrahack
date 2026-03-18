// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Edit2, Save, X, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateProfile } from '../services/auth';

const Profile = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const profile = await getUserProfile();
                setUserData(profile);
                setFormData(profile);
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (user && !authLoading) {
            fetchUserData();
        }
    }, [user, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setError('');
            setSuccess('');
            const updated = await updateProfile(formData);
            setUserData(updated);
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        setFormData(userData);
        setIsEditing(false);
        setError('');
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
                <div className="text-emerald-600 font-bold text-lg">Loading profile...</div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen pt-24 bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
                <div className="text-red-600 font-bold text-lg">Failed to load profile</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20 px-6 bg-[#F8FAFC]">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all group"
                    >
                        <ArrowLeft size={24} className="text-slate-600 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            User <span className="text-emerald-600">Profile</span>
                        </h1>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-8">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white bg-white flex items-center justify-center shadow-lg">
                                <User size={48} className="text-emerald-600" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-black mb-2">{userData.fullName}</h1>
                            <p className="text-green-100 font-bold capitalize mb-2 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm shadow-sm border border-white/10">
                                {userData.userType === 'farmer' ? '🌱 Farmer' : '🛒 Buyer'}
                            </p>
                            <p className="text-green-50 flex items-center gap-2 font-medium">
                                <Mail size={18} /> {userData.email}
                            </p>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white text-emerald-600 px-6 py-3 rounded-2xl hover:bg-emerald-50 transition-colors font-bold flex items-center gap-2 shadow-lg"
                            >
                                <Edit2 size={18} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {success && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-2xl mb-6 flex items-center gap-2 shadow-sm">
                        <CheckCircle size={20} className="text-emerald-500" />
                        <p className="font-bold">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-2xl mb-6 shadow-sm">
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                    <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                        Account Information
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                                <User size={16} className="text-slate-400" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3.5 rounded-2xl border-2 font-medium ${
                                    isEditing
                                        ? 'border-slate-200 focus:border-emerald-500 bg-white outline-none focus:ring-4 focus:ring-emerald-500/10'
                                        : 'border-transparent bg-slate-50 text-slate-600 outline-none cursor-not-allowed'
                                } transition-all`}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={userData.email || ''}
                                disabled
                                className="w-full px-4 py-3.5 rounded-2xl border-2 border-transparent bg-slate-50 text-slate-600 font-medium outline-none cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                                    <User size={16} className="text-slate-400" />
                                    Account Role
                                </label>
                                <select
                                    name="userType"
                                    value={formData.userType || 'farmer'}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3.5 rounded-2xl border-2 font-medium ${
                                        isEditing
                                            ? 'border-slate-200 focus:border-emerald-500 bg-white outline-none focus:ring-4 focus:ring-emerald-500/10'
                                            : 'border-transparent bg-slate-50 text-slate-600 outline-none cursor-not-allowed appearance-none'
                                    } transition-all`}
                                >
                                    <option value="farmer">Farmer</option>
                                    <option value="buyer">Buyer</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" />
                                    Region
                                </label>
                                <select
                                    name="region"
                                    value={formData.region || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3.5 rounded-2xl border-2 font-medium ${
                                        isEditing
                                            ? 'border-slate-200 focus:border-emerald-500 bg-white outline-none focus:ring-4 focus:ring-emerald-500/10'
                                            : 'border-transparent bg-slate-50 text-slate-600 outline-none cursor-not-allowed appearance-none'
                                    } transition-all`}
                                >
                                    <option value="">Select region</option>
                                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                                    <option value="Selangor">Selangor</option>
                                    <option value="Penang">Penang</option>
                                    <option value="Johor">Johor</option>
                                    <option value="Perak">Perak</option>
                                    <option value="Pahang">Pahang</option>
                                    <option value="Terengganu">Terengganu</option>
                                    <option value="Kelantan">Kelantan</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                                <Leaf size={16} className="text-slate-400" />
                                Primary Crop
                            </label>
                            <input
                                type="text"
                                name="cropType"
                                value={formData.cropType || ''}
                                onChange={handleChange}
                                placeholder="e.g., Tomatoes, Cabbage"
                                disabled={!isEditing}
                                className={`w-full px-4 py-3.5 rounded-2xl border-2 font-medium ${
                                    isEditing
                                        ? 'border-slate-200 focus:border-emerald-500 bg-white outline-none focus:ring-4 focus:ring-emerald-500/10'
                                        : 'border-transparent bg-slate-50 text-slate-600 outline-none cursor-not-allowed'
                                } transition-all`}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-4 mt-10 pt-6 border-t border-slate-100">
                            <button
                                onClick={handleCancel}
                                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-slate-900 text-white hover:bg-emerald-600 font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Leaf = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);

export default Profile;