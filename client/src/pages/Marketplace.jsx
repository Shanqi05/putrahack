import React, { useState } from 'react';
import { ShoppingCart, Zap, TrendingUp, Star, MapPin, User, Heart, MessageCircle } from 'lucide-react';

const Marketplace = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);

    const products = [
        {
            id: 1,
            name: 'Fresh Organic Tomatoes',
            farmer: 'Rajesh Kumar',
            price: '₹45/kg',
            rating: 4.8,
            reviews: 342,
            image: 'https://images.unsplash.com/photo-1592841494900-055cc009f82e?w=400&h=300&fit=crop',
            location: 'Karnataka',
            quantity: '500 kg available',
            freshness: 'Harvested Today'
        },
        {
            id: 2,
            name: 'Golden Carrots',
            farmer: 'Priya Singh',
            price: '₹30/kg',
            rating: 4.6,
            reviews: 218,
            image: 'https://images.unsplash.com/photo-1584622181473-0410db6ae03a?w=400&h=300&fit=crop',
            location: 'Punjab',
            quantity: '300 kg available',
            freshness: 'Harvested Today'
        },
        {
            id: 3,
            name: 'Green Bell Peppers',
            farmer: 'Amit Patel',
            price: '₹60/kg',
            rating: 4.9,
            reviews: 156,
            image: 'https://images.unsplash.com/photo-1599599810694-f3ee2c08a2d4?w=400&h=300&fit=crop',
            location: 'Gujarat',
            quantity: '250 kg available',
            freshness: 'Harvested Today'
        },
        {
            id: 4,
            name: 'Sweet Mangoes',
            farmer: 'Dev Sharma',
            price: '₹70/kg',
            rating: 4.7,
            reviews: 412,
            image: 'https://images.unsplash.com/photo-1553530666-ba2a7fc5778c?w=400&h=300&fit=crop',
            location: 'Maharashtra',
            quantity: '400 kg available',
            freshness: 'Harvested Day Before'
        },
        {
            id: 5,
            name: 'Organic Cabbage',
            farmer: 'Neha Gupta',
            price: '₹25/kg',
            rating: 4.5,
            reviews: 189,
            image: 'https://images.unsplash.com/photo-1553530666-ba2a7fc5778c?w=400&h=300&fit=crop',
            location: 'Himachal Pradesh',
            quantity: '600 kg available',
            freshness: 'Harvested Today'
        },
        {
            id: 6,
            name: 'Sweet Corn',
            farmer: 'Vikram Reddy',
            price: '₹40/dozen',
            rating: 4.8,
            reviews: 267,
            image: 'https://images.unsplash.com/photo-1599599810694-f3ee2c08a2d4?w=400&h=300&fit=crop',
            location: 'Telangana',
            quantity: '200 dozen available',
            freshness: 'Harvested Today'
        },
    ];

    return (
        <div className="pt-24 px-6 pb-20 bg-gradient-to-b from-slate-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="relative p-12 md:p-20 rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white mb-20">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-300/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8">
                            <ShoppingCart size={16} className="text-blue-200" />
                            <span className="text-sm font-bold uppercase">Direct Farm to Market</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6">Buy Direct from Farmers</h1>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl">
                            Fresh produce directly from verified farmers. No middlemen, best prices, guaranteed quality. Support your local farmers and eat fresh.
                        </p>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="mb-16">
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Search crops..."
                                className="px-6 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none transition-all"
                            />
                            <select className="px-6 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none transition-all">
                                <option>All Categories</option>
                                <option>Vegetables</option>
                                <option>Fruits</option>
                                <option>Grains</option>
                            </select>
                            <select className="px-6 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 outline-none transition-all">
                                <option>All Regions</option>
                                <option>Karnataka</option>
                                <option>Punjab</option>
                                <option>Gujarat</option>
                            </select>
                            <button className="bg-blue-500 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-600 transition-all">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12">Fresh Products Available</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                                onClick={() => setSelectedProduct(product)}
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-200 overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                    />
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                                        {product.freshness}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{product.name}</h3>

                                    {/* Farmer Info */}
                                    <div className="flex items-center space-x-2 mb-4 text-sm text-slate-600">
                                        <User size={16} />
                                        <span className="font-bold">{product.farmer}</span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center space-x-2 mb-4 text-sm text-slate-600">
                                        <MapPin size={16} className="text-blue-500" />
                                        <span>{product.location}</span>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-bold text-slate-900">{product.rating}</span>
                                        <span className="text-sm text-slate-600">({product.reviews} reviews)</span>
                                    </div>

                                    {/* Quantity */}
                                    <p className="text-sm text-slate-600 mb-4 font-semibold">{product.quantity}</p>

                                    {/* Price & Button */}
                                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                        <div className="text-2xl font-black text-blue-600">{product.price}</div>
                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-all">
                                                <Heart size={20} className="text-red-500" />
                                            </button>
                                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center space-x-1">
                                                <ShoppingCart size={16} />
                                                <span>Buy</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Buy From Us Section */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Why Buy From TripleGain?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Ultra Fresh', desc: 'Harvested and delivery within 24 hours' },
                            { icon: TrendingUp, title: 'Best Prices', desc: 'Direct from farmers, no middlemen margins' },
                            { icon: MessageCircle, title: 'Direct Chat', desc: 'Talk to farmers, know your food source' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-500 text-center">
                                <div className="text-blue-500 mb-4 flex justify-center">
                                    <item.icon size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black mb-4">Become a Buyer Today</h3>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl">Get fresh, organic produce directly from verified farmers in your region.</p>
                        <button className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform">
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
