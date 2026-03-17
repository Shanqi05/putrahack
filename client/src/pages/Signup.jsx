import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Eye, EyeOff, Leaf, ArrowRight, CheckCircle } from 'lucide-react';
import { signup as apiSignup } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        region: '',
        userType: 'farmer', // or 'buyer'
        agreedToTerms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login: setAuthUser } = useAuth();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.agreedToTerms) {
                throw new Error('You must agree to the Terms of Service and Privacy Policy');
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (formData.password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Call backend signup
            const result = await apiSignup(
                formData.email,
                formData.password,
                formData.fullName,
                formData.userType,
                '', // cropType - can be added later
                formData.region
            );

            // Update global auth context with user info and token
            setAuthUser(result.user, result.token);

            navigate(formData.userType === 'farmer' ? '/farmer-dashboard' : '/');
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-green-50">
            <div className="max-w-2xl mx-auto">
                {/* Logo Section */}
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#10B981] p-3 rounded-2xl">
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
                                <label className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.userType === 'farmer'
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-emerald-200 hover:border-emerald-300 bg-white'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="farmer"
                                        checked={formData.userType === 'farmer'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={20} className={formData.userType === 'farmer' ? 'text-emerald-600' : 'text-gray-300'} />
                                        <span className="font-bold text-emerald-900">Farmer</span>
                                    </div>
                                </label>
                                <label className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.userType === 'buyer'
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-emerald-200 hover:border-emerald-300 bg-white'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="buyer"
                                        checked={formData.userType === 'buyer'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={20} className={formData.userType === 'buyer' ? 'text-emerald-600' : 'text-gray-300'} />
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

                        {/* Region */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-emerald-600" />
                                Region
                            </label>
                            <select
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                required
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
                            <input 
                                type="checkbox" 
                                name="agreedToTerms"
                                checked={formData.agreedToTerms}
                                onChange={handleChange}
                                className="w-5 h-5 mt-1 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" 
                            />
                            <span className="font-light text-sm">I agree to the <span className="font-bold">Terms of Service</span> and <span className="font-bold">Privacy Policy</span></span>
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
