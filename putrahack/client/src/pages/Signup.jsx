import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Leaf, ArrowRight, CheckCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        role: 'farmer' // or 'buyer'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, {
                displayName: formData.fullName
            });

            // Save user info to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                role: formData.role,
                createdAt: new Date(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName}`
            });

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-green-50">
            <div className="max-w-2xl mx-auto">
                {/* Logo Section */}
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-3 rounded-2xl">
                        <Leaf size={32} className="text-white" fill="white" />
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-8 md:p-10">
                    <h1 className="text-4xl font-black text-emerald-900 mb-2 text-center">Join TripleGain</h1>
                    <p className="text-center text-green-700 mb-8 font-light">Create your account to start farming smarter</p>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                            <p className="font-semibold text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <User size={18} className="text-emerald-600" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-3">I am a:</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.role === 'farmer'
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-emerald-200 hover:border-emerald-300 bg-white'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="farmer"
                                        checked={formData.role === 'farmer'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={20} className={formData.role === 'farmer' ? 'text-emerald-600' : 'text-gray-300'} />
                                        <span className="font-bold text-emerald-900">Farmer</span>
                                    </div>
                                </label>
                                <label className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.role === 'buyer'
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-emerald-200 hover:border-emerald-300 bg-white'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="buyer"
                                        checked={formData.role === 'buyer'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={20} className={formData.role === 'buyer' ? 'text-emerald-600' : 'text-gray-300'} />
                                        <span className="font-bold text-emerald-900">Buyer</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <Mail size={18} className="text-emerald-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                required
                            />
                        </div>

                        {/* Phone & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                    <Phone size={18} className="text-emerald-600" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+60 123456789"
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                    <MapPin size={18} className="text-emerald-600" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, State"
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <Lock size={18} className="text-emerald-600" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 8 characters"
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <Lock size={18} className="text-emerald-600" />
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <label className="flex items-start gap-3 text-emerald-700 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 mt-1 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                            <span className="font-light text-sm">I agree to the Terms of Service and Privacy Policy</span>
                        </label>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-emerald-400/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : (
                                <>
                                    Create Account
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-emerald-700 mt-8 font-light">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                            Login Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
