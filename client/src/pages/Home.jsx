import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Microscope, ShoppingCart, Recycle, Zap, Cloud, MapPin, MessageCircle, AlertCircle, Droplets, Wind } from 'lucide-react';
import { getWeatherAlert } from '../services/weather';
import { useAuth } from '../context/AuthContext';

// Chatbot Logo Component (Fixed on all pages)
const ChatbotLogo = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-0 right-0 z-[999]">
            {isOpen && (
                <div className="absolute bottom-20 right-0 bg-gradient-to-br from-emerald-400 to-green-300 rounded-2xl p-6 w-80 shadow-2xl mb-4 animate-fadeIn border border-emerald-300/60">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-green-900">TripleGain AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-green-900 hover:text-green-700">✕</button>
                    </div>
                    <p className="text-green-900/80 text-sm leading-relaxed mb-4">
                        Welcome! I'm your AI farming companion. Ask me anything about crop disease detection, marketplace pricing, or agricultural waste management.
                    </p>
                    <input type="text" placeholder="Ask a question..." className="w-full px-4 py-2 rounded-lg bg-white/80 text-green-900 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-br from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 text-white rounded-full p-4 shadow-2xl hover:shadow-emerald-400/50 transition-all duration-300 transform hover:scale-110 border-2 border-white/30 m-4">
                <MessageCircle size={28} fill="white" />
            </button>
        </div>
    );
};

const ServiceSection = ({ title, description, icon: Icon, link, image }) => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleExploreClick = () => {
        if (!isLoggedIn()) {
            setShowLoginPrompt(true);
        } else {
            navigate(link);
        }
    };

    const handleLoginConfirm = () => {
        setShowLoginPrompt(false);
        navigate('/login');
    };

    return (
        <>
            <section className="relative min-w-full h-screen flex items-center justify-center snap-start overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url(${image})` }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/70 via-green-300/60 to-white/80"></div>
                </div>

                <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-emerald-500 to-transparent opacity-60"></div>

                <div className="relative z-10 text-center px-8 max-w-5xl animate-fadeIn">
                    <div className="flex justify-center mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="p-6 bg-gradient-to-br from-emerald-400/40 to-green-300/30 backdrop-blur-xl rounded-3xl border border-emerald-300/60 shadow-2xl hover:shadow-emerald-400/50">
                            <Icon size={52} className="text-emerald-700 drop-shadow-lg" />
                        </div>
                    </div>

                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-emerald-900 mb-6 tracking-tight uppercase animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        {title}
                    </h2>

                    <p className="text-base md:text-xl lg:text-2xl text-green-900/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-slideUp" style={{ animationDelay: '0.3s' }}>
                        {description}
                    </p>

                    <button
                        onClick={handleExploreClick}
                        className="inline-block animate-slideUp cursor-pointer"
                        style={{ animationDelay: '0.4s' }}>
                        <div className="px-12 md:px-16 py-4 bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold rounded-full hover:from-emerald-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-emerald-400/50 border border-white/40">
                            Explore Now
                        </div>
                    </button>
                </div>
            </section>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full mx-4 shadow-2xl border border-emerald-200 animate-slideUp">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-gradient-to-br from-emerald-400/40 to-green-300/30 rounded-2xl">
                                <AlertCircle size={40} className="text-emerald-700" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-emerald-900 text-center mb-4">Login Required</h2>
                        <p className="text-emerald-700/80 text-center mb-8 font-light">
                            Please log in to explore new function
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="flex-1 px-6 py-3 border-2 border-emerald-300 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLoginConfirm}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold rounded-2xl hover:from-emerald-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Crop Gallery Item Component
const CropCard = ({ name, image, price, growtime }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="relative w-full h-64 overflow-hidden rounded-2xl border-2 border-emerald-300/60 cursor-pointer group shadow-lg hover:shadow-emerald-400/50 transition-all duration-300 hover:border-emerald-300 bg-emerald-50"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}>

            {/* Image */}
            <div className={`absolute inset-0 transition-all duration-500 ${showInfo ? 'scale-110 blur-sm opacity-20' : 'scale-100 blur-0 opacity-100'}`}>
                <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-600/20 to-emerald-900/60"></div>

            {/* Info Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-green-700/95 to-emerald-700/95 flex items-center justify-center transition-all duration-500 ${showInfo ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-6 text-yellow-300">{name}</h3>
                    <div className="space-y-4">
                        <div className="bg-yellow-400/20 rounded-lg p-3 border-2 border-yellow-300/60 backdrop-blur">
                            <span className="text-yellow-200 font-bold text-sm">Market Price</span>
                            <p className="text-3xl font-black text-yellow-300 mt-1">{price}</p>
                        </div>
                        <div className="bg-blue-300/20 rounded-lg p-3 border-2 border-blue-300/60 backdrop-blur">
                            <span className="text-blue-200 font-bold text-sm">Growing Time</span>
                            <p className="text-xl font-bold text-blue-300 mt-1">{growtime}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Label */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-emerald-950/95 via-emerald-900/80 to-transparent transition-all duration-500 ${showInfo ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                <p className="text-white font-bold text-lg">{name}</p>
                <p className="text-emerald-100 text-sm">Hover for details</p>
            </div>
        </div>
    );
};

const Home = () => {
    const horizontalScrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexRef = useRef(0);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherError, setWeatherError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('kuala_lumpur');
    const [loading, setLoading] = useState(false);

    // Malaysian Farming Regions with coordinates (13 Regions)
    const locations = {
        kuala_lumpur: { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869 },
        selangor: { name: 'Selangor', lat: 2.7258, lon: 101.5244 },
        penang: { name: 'Penang', lat: 5.4164, lon: 100.3327 },
        johor: { name: 'Johor', lat: 1.4854, lon: 103.7618 },
        perak: { name: 'Perak', lat: 4.5921, lon: 101.0901 },
        pahang: { name: 'Pahang', lat: 3.8126, lon: 103.3256 },
        terengganu: { name: 'Terengganu', lat: 5.3117, lon: 102.8381 },
        kelantan: { name: 'Kelantan', lat: 6.1256, lon: 102.2381 },
        kedah: { name: 'Kedah', lat: 6.1184, lon: 100.3688 },
        sabah: { name: 'Sabah', lat: 5.3788, lon: 117.8753 },
        sarawak: { name: 'Sarawak', lat: 1.5533, lon: 110.3593 },
        putrajaya: { name: 'Putrajaya', lat: 2.7258, lon: 101.6964 },
        negeri_sembilan: { name: 'Negeri Sembilan', lat: 2.7258, lon: 101.9424 }
    };

    // Agriculture Images
const images = [
    // Hero: Aerial view of high-tech agriculture
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2000&auto=format", 
    // Disease Detection: Extreme macro of leaf veins
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2000&auto=format",
    // Marketplace: Vibrant, organized farm produce
    "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=2000",
    // Leftover: Golden hour field representing renewal
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2000"
];

    // Crop data
    const crops = [
        {
            name: 'Tomato',
            image: 'https://images.unsplash.com/photo-1444731961956-751ed90465a5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 3.50/kg',
            growtime: '60-85 days'
        },
        {
            name: 'Lettuce',
            image: 'https://images.unsplash.com/photo-1556781366-336f8353ba7c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 4.00/piece',
            growtime: '45-60 days'
        },
        {
            name: 'Carrot',
            image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 2.80/kg',
            growtime: '70-80 days'
        },
        {
            name: 'Bell Pepper',
            image: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 5.50/kg',
            growtime: '75-90 days'
        },
        {
            name: 'Cucumber',
            image: 'https://images.unsplash.com/photo-1676043966926-c575c1ef320a?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 2.50/piece',
            growtime: '50-70 days'
        },
        {
            name: 'Broccoli',
            image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=901&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 4.20/piece',
            growtime: '55-100 days'
        },
        {
            name: 'Spinach',
            image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 3.80/bundle',
            growtime: '40-50 days'
        },
        {
            name: 'Pumpkin',
            image: 'https://plus.unsplash.com/premium_photo-1666823706428-5d93ae18c1c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            price: 'RM 6.50/kg',
            growtime: '80-120 days'
        }
    ];

    // Horizontal scroll
    useEffect(() => {
        const el = horizontalScrollRef.current;
        if (!el) return;

        let isScrolling = false;
        let scrollTimeout;

        const onWheel = (e) => {
            const rect = el.getBoundingClientRect();
            const isInHorizontalSection = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;

            if (!isInHorizontalSection) return;

            if (e.deltaY === 0) return;

            // Allow vertical scroll when on the last page (Leftover) and scrolling down
            const isAtLastPage = activeIndexRef.current === 3;
            const isScrollingDown = e.deltaY > 0;

            if (isAtLastPage && isScrollingDown) {
                return; // Allow normal vertical scrolling
            }

            e.preventDefault();

            if (isScrolling) return;
            isScrolling = true;

            const scrollAmount = e.deltaY > 0 ? window.innerWidth : -window.innerWidth;
            const currentScroll = el.scrollLeft;
            const targetScroll = currentScroll + scrollAmount;

            el.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });

            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 600);
        };

        const handleScroll = () => {
            const index = Math.round(el.scrollLeft / window.innerWidth);
            setActiveIndex(Math.min(Math.max(index, 0), 3));
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('scroll', handleScroll);

        return () => {
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    // Fetch weather data
    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            setWeatherError(null);
            try {
                const location = locations[selectedLocation];
                if (!location) {
                    setWeatherError('Location not found');
                    return;
                }
                
                const data = await getWeatherAlert(location.lat, location.lon, 'General');
                setWeatherData(data);
            } catch (error) {
                console.error('Failed to load weather:', error);
                setWeatherError('Unable to fetch weather data. Check the backend API configuration.');
            }
            setLoading(false);
        };

        fetchWeather();
    }, [selectedLocation]);

    // Sync activeIndex to ref
    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    return (
        <div className="bg-gradient-to-b from-white via-emerald-50/80 to-green-50 font-sans overflow-x-hidden">

            {/* ===== SECTION 1: HORIZONTAL SCROLL ===== */}
            <section className="relative w-screen h-screen overflow-hidden">

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-300/15 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 right-0 w-80 h-80 bg-emerald-200/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Progress Indicators */}
                <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-8">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => {
                                if (horizontalScrollRef.current) {
                                    horizontalScrollRef.current.scrollTo({
                                        left: i * window.innerWidth,
                                        behavior: 'smooth'
                                    });
                                }
                            }}>
                            <div className={`transition-all duration-700 rounded-full ${activeIndex === i
                                ? 'bg-emerald-500 h-2 w-16 shadow-lg shadow-emerald-400/60'
                                : 'bg-emerald-400/30 h-1 w-8 hover:bg-emerald-400/60'
                                }`}></div>
                        </div>
                    ))}
                </div>

                {/* Horizontal Scroll Container */}
                <div ref={horizontalScrollRef}
                    className="h-full w-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                    {/* Page 1: Hero */}
                    <section className="relative min-w-full h-screen flex items-center snap-start bg-gradient-to-br from-emerald-200 via-emerald-100 to-green-50 px-8 md:px-16 lg:px-24 overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-center opacity-30"
                            style={{ backgroundImage: `url(${images[0]})` }}></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-green-300/10 to-transparent"></div>

                        <div className="relative z-10 max-w-6xl">
                            <div className="flex items-center gap-3 text-emerald-700 font-bold tracking-widest uppercase text-xs md:text-sm mb-8 animate-slideUp">
                                <Zap size={18} fill="currentColor" className="animate-pulse" />
                                TripleGain Protocol
                            </div>
                            <h1 className="text-6xl md:text-7xl lg:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 leading-[0.9] mb-8 tracking-tighter animate-slideUp drop-shadow-lg" style={{ animationDelay: '0.1s' }}>
                                BEYOND <br /> FARMING
                            </h1>
                            <p className="text-lg md:text-2xl text-green-900/90 max-w-2xl font-light leading-relaxed mb-12 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                                Scroll with mouse wheel to explore our innovations.
                            </p>
                            <div className="flex flex-wrap gap-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                                <Link to="/disease-detection">
                                    <button className="px-8 md:px-10 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold rounded-full hover:from-emerald-400 hover:to-green-300 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 shadow-lg shadow-emerald-500/50 hover:shadow-emerald-400/70 border border-white/30 backdrop-blur-sm">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="absolute top-20 right-10 w-40 h-40 border-2 border-emerald-400/40 rounded-full animate-float"></div>
                        <div className="absolute bottom-32 right-1/3 w-32 h-32 border-2 border-green-300/40 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                    </section>

                    {/* Page 2: Disease Detection */}
                    <ServiceSection
                        title="Disease Detection"
                        description="Real-time monitoring using neural networks to identify crop stress 48 hours before visible outbreaks occur. Protect your harvest with AI-powered insights."
                        icon={Microscope}
                        link="/disease-detection"
                        image={images[1]}
                    />

                    {/* Page 3: Marketplace */}
                    <ServiceSection
                        title="Marketplace"
                        description="Connect directly with buyers and maximize profits. Blockchain-secured transactions with integrated global logistics for seamless farm-to-market delivery."
                        icon={ShoppingCart}
                        link="/marketplace"
                        image={images[2]}
                    />

                    {/* Page 4: Leftover */}
                    <ServiceSection
                        title="Leftover"
                        description="Transform agricultural waste into green energy. Create additional revenue streams while contributing to sustainable environmental practices and zero-waste farming."
                        icon={Recycle}
                        link="/leftover"
                        image={images[3]}
                    />
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-200/30 z-[100] backdrop-blur-sm">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 transition-all duration-500 shadow-lg shadow-emerald-400/50"
                        style={{ width: `${((activeIndex + 1) / 4) * 100}%` }}></div>
                </div>

                {/* Scroll Hint */}
                <div className="fixed bottom-8 right-20 z-40 hidden md:block animate-bounce">
                    <div className="text-emerald-700 text-xs font-bold">SCROLL</div>
                    <div className="w-px h-6 bg-gradient-to-b from-emerald-500 to-transparent mx-auto mt-2"></div>
                </div>
            </section>

            {/* ===== SECTION 2: WEATHER ALERT ===== */}
            <section className="relative w-screen min-h-screen py-20 px-8 flex items-center justify-center bg-gradient-to-b from-green-50 via-emerald-50 to-white overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2000)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/50 via-green-200/40 to-green-50/60"></div>

                <div className="relative z-10 w-full max-w-3xl">
                    <div className="text-center mb-12 animate-slideUp">
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-gradient-to-br from-emerald-300/40 to-green-200/40 backdrop-blur-xl rounded-3xl border-2 border-emerald-300/60 shadow-2xl">
                                <Cloud size={52} className="text-emerald-700" />
                            </div>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 mb-6 tracking-tight uppercase drop-shadow-lg\">
                            Weather Alert
                        </h2>
                        <p className="text-base md:text-xl text-green-900/90\">
                            Real-time weather forecasts for optimal farming decisions
                        </p>
                    </div>

                    {/* Location Selector */}
                    <div className="bg-gradient-to-br from-emerald-100/80 to-green-100/70 backdrop-blur-xl rounded-2xl border-2 border-emerald-300/60 p-8 mb-8 animate-slideUp shadow-xl hover:shadow-emerald-400/40 transition-all" style={{ animationDelay: '0.2s' }}>
                        <label className="block text-emerald-900 font-bold mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-emerald-600" />
                            Select Your Region
                        </label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-white rounded-lg px-4 py-3 text-emerald-900 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300/60 transition-all border-2 border-emerald-300/70 hover:border-emerald-400 shadow-md">
                            <option value="kuala_lumpur">Kuala Lumpur</option>
                            <option value="selangor">Selangor</option>
                            <option value="penang">Penang</option>
                            <option value="johor">Johor</option>
                            <option value="perak">Perak</option>
                            <option value="pahang">Pahang</option>
                            <option value="terengganu">Terengganu</option>
                            <option value="kelantan">Kelantan</option>
                            <option value="kedah">Kedah</option>
                            <option value="sabah">Sabah</option>
                            <option value="sarawak">Sarawak</option>
                            <option value="putrajaya">Putrajaya</option>
                            <option value="negeri_sembilan">Negeri Sembilan</option>
                        </select>
                    </div>

                    {/* Weather Display */}
                    {loading ? (
                        <div className="text-center text-emerald-600/60 py-12 animate-pulse font-semibold">Loading weather data...</div>
                    ) : weatherError ? (
                        <div className="text-center text-red-600 py-12 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center gap-2">
                            <AlertCircle size={20} />
                            {weatherError}
                        </div>
                    ) : weatherData ? (
                        <div className="space-y-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                            {/* Current Weather */}
                            <div className="bg-gradient-to-br from-emerald-200/60 to-green-100/50 backdrop-blur-lg rounded-2xl border-2 border-emerald-300/70 p-8 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-400/50 transition-all duration-300">
                                <h3 className="text-2xl text-emerald-900 font-black mb-6">Current Weather</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white/60 rounded-xl p-4 backdrop-blur">
                                        <p className="text-emerald-600 text-sm font-bold mb-1">Temperature</p>
                                        <p className="text-3xl font-black text-emerald-700">{weatherData.currentWeather.temperature}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-xl p-4 backdrop-blur">
                                        <p className="text-emerald-600 text-sm font-bold mb-1 flex items-center gap-1">
                                            <Droplets size={14} /> Humidity
                                        </p>
                                        <p className="text-3xl font-black text-blue-600">{weatherData.currentWeather.humidity}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-xl p-4 backdrop-blur">
                                        <p className="text-emerald-600 text-sm font-bold mb-1 flex items-center gap-1">
                                            <Wind size={14} /> Wind
                                        </p>
                                        <p className="text-xl font-black text-green-600">{weatherData.currentWeather.windSpeed}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-xl p-4 backdrop-blur">
                                        <p className="text-emerald-600 text-sm font-bold mb-1">Rainfall</p>
                                        <p className="text-3xl font-black text-cyan-600">{weatherData.currentWeather.precipitation}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Weather Alerts */}
                            {weatherData.alerts && weatherData.alerts.length > 0 && (
                                <div className="bg-gradient-to-br from-yellow-100/80 to-orange-50/70 backdrop-blur-lg rounded-2xl border-2 border-yellow-300/70 p-8">
                                    <h3 className="text-2xl text-yellow-900 font-black mb-4 flex items-center gap-2">
                                        <AlertCircle size={28} className="text-yellow-600" />
                                        Active Alerts
                                    </h3>
                                    <div className="space-y-3">
                                        {weatherData.alerts.map((alert, idx) => (
                                            <div key={idx} className="bg-white/60 rounded-xl p-4 backdrop-blur border-l-4 border-yellow-600">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">{alert.icon}</span>
                                                    <div>
                                                        <p className="font-bold text-yellow-900 capitalize">{alert.level}</p>
                                                        <p className="text-yellow-900/90 text-sm">{alert.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 7-Day Forecast */}
                            <div className="bg-gradient-to-br from-cyan-100/60 to-blue-100/50 backdrop-blur-lg rounded-2xl border-2 border-cyan-300/70 p-8">
                                <h3 className="text-2xl text-cyan-900 font-black mb-4">7-Day Forecast</h3>
                                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                                    {weatherData.sevenDayForecast.dates.map((date, idx) => (
                                        <div key={idx} className="bg-white/60 rounded-lg p-3 text-center backdrop-blur hover:bg-white/80 transition-all">
                                            <p className="text-cyan-700 font-bold text-xs mb-2">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                            <p className="text-2xl font-black text-orange-600">{Math.round(weatherData.sevenDayForecast.maxTemps[idx])}°</p>
                                            <p className="text-xs text-cyan-600">{Math.round(weatherData.sevenDayForecast.minTemps[idx])}°</p>
                                            <p className="text-xs text-blue-600 font-bold mt-1">💧 {weatherData.sevenDayForecast.precipitation[idx]}mm</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-green-900/60 py-12">Unable to load weather data</div>
                    )}
                </div>
            </section>

            {/* ===== SECTION 3: ABOUT CROPS ===== */}
            <section className="relative w-screen py-32 px-8 bg-gradient-to-b from-green-50 via-emerald-100/40 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 animate-slideUp">
                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 mb-6 tracking-tight">
                            About Crops
                        </h2>
                        <p className="text-base md:text-xl text-green-900/90 max-w-2xl mx-auto font-light leading-relaxed">
                            Hover over any crop to see current market prices and growing time
                        </p>
                    </div>

                    {/* Crops Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        {crops.map((crop, idx) => (
                            <CropCard
                                key={idx}
                                name={crop.name}
                                image={crop.image}
                                price={crop.price}
                                growtime={crop.growtime}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-black border-t border-gray-800 py-12 px-8">
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <p className="text-white font-semibold">© 2026 TripleGain Protocol</p>
                    <p className="text-white/80 mt-2">Empowering sustainable agriculture for a better future</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
