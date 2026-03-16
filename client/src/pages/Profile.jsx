import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Edit2, Save, X, CheckCircle } from 'lucide-react';
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
        <div className="min-h-screen pt-24 pb-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-green-50">
            <div className="max-w-2xl mx-auto">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl mb-8">
                    <div className="flex items-center gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white bg-white flex items-center justify-center">
                                <User size={48} className="text-emerald-600" />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-black mb-2">{userData.fullName}</h1>
                            <p className="text-green-100 font-semibold capitalize mb-2 inline-block bg-white/20 px-4 py-1 rounded-full">
                                {userData.userType === 'farmer' ? '🌱 Farmer' : '🛒 Buyer'}
                            </p>
                            <p className="text-green-100 flex items-center gap-2">
                                <Mail size={18} /> {userData.email}
                            </p>
                        </div>

                        {/* Edit Button */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white text-emerald-600 p-3 rounded-xl hover:scale-110 transition-transform font-bold flex items-center gap-2"
                            >
                                <Edit2 size={20} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <CheckCircle size={20} />
                        <p className="font-semibold">{success}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-8">
                    <h2 className="text-2xl font-black text-emerald-900 mb-6">Profile Information</h2>

                    <div className="space-y-5">
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
                                className={`w-full px-4 py-3 rounded-2xl border-2 ${
                                    isEditing
                                        ? 'border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 bg-emerald-50/50'
                                        : 'border-gray-200 bg-gray-50 text-gray-600'
                                } outline-none transition-all`}
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <Mail size={18} className="text-emerald-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={userData.email || ''}
                                disabled
                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-600 outline-none"
                            />
                        </div>

                        {/* User Type */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2">User Type</label>
                            <select
                                name="userType"
                                value={formData.userType || 'farmer'}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-2xl border-2 ${
                                    isEditing
                                        ? 'border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 bg-emerald-50/50'
                                        : 'border-gray-200 bg-gray-50 text-gray-600'
                                } outline-none transition-all`}
                            >
                                <option value="farmer">🌱 Farmer</option>
                                <option value="buyer">🛒 Buyer</option>
                            </select>
                        </div>

                        {/* Crop Type */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2">Crop Type</label>
                            <input
                                type="text"
                                name="cropType"
                                value={formData.cropType || ''}
                                onChange={handleChange}
                                placeholder="e.g., Rice, Wheat, Vegetables"
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-2xl border-2 ${
                                    isEditing
                                        ? 'border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 bg-emerald-50/50'
                                        : 'border-gray-200 bg-gray-50 text-gray-600'
                                } outline-none transition-all`}
                            />
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-emerald-600" />
                                Region
                            </label>
                            <select
                                name="region"
                                value={formData.region || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-2xl border-2 ${
                                    isEditing
                                        ? 'border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 bg-emerald-50/50'
                                        : 'border-gray-200 bg-gray-50 text-gray-600'
                                } outline-none transition-all`}
                            >
                                <option value="">Select your region</option>
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

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Save Changes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <X size={20} /> Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
