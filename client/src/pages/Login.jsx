import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-3 rounded-2xl">
                        <Leaf size={32} className="text-white" fill="white" />
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-8 md:p-10">
                    <h1 className="text-4xl font-black text-emerald-900 mb-2 text-center">Welcome Back</h1>
                    <p className="text-center text-green-700 mb-8 font-light">Login to your TripleGain account</p>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                            <p className="font-semibold text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <Mail size={18} className="text-emerald-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/30 outline-none transition-all bg-emerald-50/50"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-emerald-900 font-bold mb-2 flex items-center gap-2">
                                <Lock size={18} className="text-emerald-600" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
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

                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-emerald-700 cursor-pointer hover:text-emerald-900">
                                <input type="checkbox" className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                                Remember me
                            </label>
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                Forgot Password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-emerald-400/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : (
                                <>
                                    Login Now
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-emerald-200"></div>
                        <span className="text-emerald-600 text-sm font-semibold">or</span>
                        <div className="flex-1 h-px bg-emerald-200"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-white border-2 border-emerald-200 text-emerald-900 font-bold py-3 rounded-2xl hover:bg-emerald-50 transition-all">
                            Google
                        </button>
                        <button className="bg-white border-2 border-emerald-200 text-emerald-900 font-bold py-3 rounded-2xl hover:bg-emerald-50 transition-all">
                            GitHub
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-emerald-700 mt-8 font-light">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                            Sign Up Now
                        </Link>
                    </p>
                </div>

                {/* Bottom Decorative Elements */}
                <div className="mt-12 flex justify-center gap-2 text-emerald-300/40">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
