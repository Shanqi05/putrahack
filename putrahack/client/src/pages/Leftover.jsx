import React, { useState } from 'react';
import { Recycle, Leaf, Users, TrendingUp, Zap, Target, ArrowRight, Plus } from 'lucide-react';

const Leftover = () => {
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Unsold Tomatoes',
            farmer: 'Rajesh Kumar',
            quantity: '200 kg',
            price: '₹20/kg (50% discount)',
            image: 'https://images.unsplash.com/photo-1592841494900-055cc009f82e?w=400&h=300&fit=crop',
            expiry: '7 days',
            location: 'Bangalore',
            status: 'Available'
        },
        {
            id: 2,
            name: 'Extra Vegetables Mix',
            farmer: 'Priya Singh',
            quantity: '150 kg',
            price: '₹100/box (Discounted)',
            image: 'https://images.unsplash.com/photo-1578174370795-e5f8d9b5d8a8?w=400&h=300&fit=crop',
            expiry: '5 days',
            location: 'Pune',
            status: 'Limited'
        },
        {
            id: 3,
            name: 'Grade-B Mangoes',
            farmer: 'Dev Sharma',
            quantity: '300 kg',
            price: '₹30/kg (Wholesale)',
            image: 'https://images.unsplash.com/photo-1553530666-ba2a7fc5778c?w=400&h=300&fit=crop',
            expiry: '10 days',
            location: 'Goa',
            status: 'Available'
        },
    ]);

    return (
        <div className="pt-24 px-6 pb-20 bg-gradient-to-b from-slate-50 to-green-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="relative p-12 md:p-20 rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-white mb-20">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-300/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
                            <Recycle size={16} className="text-green-200" />
                            <span className="text-sm font-bold uppercase">Zero Waste Initiative</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6">Leftover Management</h1>
                        <p className="text-lg text-green-100 mb-8 max-w-2xl">
                            Don't waste surplus crops! Connect with local businesses and consumers. Reduce waste, earn extra income, and help your community.
                        </p>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
                    {[
                        { icon: Recycle, number: '500K+', label: 'Tons Redistributed', color: 'bg-green-100' },
                        { icon: Users, number: '50K+', label: 'Families Helped', color: 'bg-blue-100' },
                        { icon: TrendingUp, number: '₹10Cr+', label: 'Extra Income', color: 'bg-yellow-100' },
                        { icon: Leaf, number: '95%', label: 'Waste Reduced', color: 'bg-emerald-100' },
                    ].map((stat, idx) => (
                        <div key={idx} className={`${stat.color} rounded-2xl p-8 text-center shadow-lg`}>
                            <stat.icon size={40} className="mx-auto mb-4 text-green-600" />
                            <p className="text-3xl font-black text-slate-900 mb-2">{stat.number}</p>
                            <p className="text-slate-700 font-bold">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Available Products Section */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12">Available Surplus Products</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-200 overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                    />
                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                                        {product.status}
                                    </div>
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                                        Expires: {product.expiry}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{product.name}</h3>
                                    <p className="text-sm text-slate-600 mb-4 font-semibold">From: <span className="text-green-600">{product.farmer}</span></p>

                                    <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
                                        <p className="text-sm text-slate-600 mb-2">Quantity: <span className="font-bold text-slate-900">{product.quantity}</span></p>
                                        <p className="text-sm text-slate-600">Location: <span className="font-bold text-slate-900">{product.location}</span></p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-center mb-4 bg-yellow-50 rounded-xl py-3 border border-yellow-200">
                                        <p className="text-2xl font-black text-green-600">{product.price}</p>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3">
                                        <button className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center space-x-2">
                                            <span>Buy Now</span>
                                            <ArrowRight size={16} />
                                        </button>
                                        <button className="flex-1 px-4 py-3 bg-gray-100 text-slate-900 rounded-lg font-bold hover:bg-gray-200 transition-all">
                                            Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* For Farmers Section */}
                <div className="mb-20 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12 md:p-16 border-2 border-green-200">
                    <h2 className="text-4xl font-black text-slate-900 mb-12">Are You a Farmer?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Left Side */}
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-500 text-white p-3 rounded-xl flex-shrink-0">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">List Your Surplus</h3>
                                    <p className="text-slate-600 text-sm mt-1">Add leftover crops with just a few clicks</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-green-500 text-white p-3 rounded-xl flex-shrink-0">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">Instant Buyers</h3>
                                    <p className="text-slate-600 text-sm mt-1">Connect with restaurants, shops, and consumers</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-green-500 text-white p-3 rounded-xl flex-shrink-0">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">Earn Extra Income</h3>
                                    <p className="text-slate-600 text-sm mt-1">Turn waste into wealth with bulk discounts</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-green-500 text-white p-3 rounded-xl flex-shrink-0">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">Impact Tracking</h3>
                                    <p className="text-slate-600 text-sm mt-1">See how much waste you've prevented</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - CTA */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Start Selling Today</h3>
                            <form className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="What crop are you selling?"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="Quantity (e.g., 100 kg)"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="Your asking price"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-black text-lg hover:scale-105 transition-transform"
                                >
                                    List Now
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Impact Section */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Environmental Impact</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Waste Prevented',
                                stat: '500K Tons',
                                desc: 'Food waste diverted from landfills',
                                icon: '♻️'
                            },
                            {
                                title: 'CO2 Saved',
                                stat: '125K Tons',
                                desc: 'Equivalent to planting 2M trees',
                                icon: '🌱'
                            },
                            {
                                title: 'People Helped',
                                stat: '50K+',
                                desc: 'Families with access to affordable food',
                                icon: '🤝'
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg text-center border-t-4 border-green-500">
                                <p className="text-5xl mb-4">{item.icon}</p>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">{item.stat}</h3>
                                <p className="text-slate-600 font-bold mb-2">{item.title}</p>
                                <p className="text-sm text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black mb-4">Join the Zero Waste Movement</h3>
                        <p className="text-lg text-green-100 mb-8 max-w-2xl">Help reduce food waste while earning extra income. Every surplus crop counts!</p>
                        <button className="bg-white text-green-600 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
                            Get Started Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leftover;
