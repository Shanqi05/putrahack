import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, ShoppingCart, Recycle, Zap, Cloud, MapPin, MessageCircle } from 'lucide-react';
import { getWeatherForecast } from '../services/weather';

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

const ServiceSection = ({ title, description, icon: Icon, link, image }) => (
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

            <Link to={link} className="inline-block animate-slideUp" style={{ animationDelay: '0.4s' }}>
                <button className="px-12 md:px-16 py-4 bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold rounded-full hover:from-emerald-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-emerald-400/50 border border-white/40">
                    Explore Now
                </button>
            </Link>
        </div>
    </section>
);

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
    const [selectedLocation, setSelectedLocation] = useState('Kuala Lumpur');
    const [loading, setLoading] = useState(false);

    // Agriculture Images
    const images = [
        "https://images.unsplash.com/photo-1500382017468-7049fae79eba?q=80&w=2000",
        "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=2000",
        "https://images.unsplash.com/photo-1488459716781-6f3ee3c3d1b4?q=80&w=2000",
        "https://images.unsplash.com/photo-1500934266881-b72b27e84530?q=80&w=2000"
    ];

    // Crop data
    const crops = [
        {
            name: 'Tomato',
            image: 'https://images.unsplash.com/photo-1505521181222-12a8c15ce29f?q=80&w=800',
            price: 'RM 3.50/kg',
            growtime: '60-85 days'
        },
        {
            name: 'Lettuce',
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800',
            price: 'RM 4.00/piece',
            growtime: '45-60 days'
        },
        {
            name: 'Carrot',
            image: 'https://images.unsplash.com/photo-1447789519551-79d440a2a0ae?q=80&w=800',
            price: 'RM 2.80/kg',
            growtime: '70-80 days'
        },
        {
            name: 'Bell Pepper',
            image: 'https://images.unsplash.com/photo-1525174711885-d5b0c3654921?q=80&w=800',
            price: 'RM 5.50/kg',
            growtime: '75-90 days'
        },
        {
            name: 'Cucumber',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800',
            price: 'RM 2.50/piece',
            growtime: '50-70 days'
        },
        {
            name: 'Broccoli',
            image: 'https://images.unsplash.com/photo-1470789033566-c68f61800f27?q=80&w=800',
            price: 'RM 4.20/piece',
            growtime: '55-100 days'
        },
        {
            name: 'Spinach',
            image: 'https://images.unsplash.com/photo-1536379937592-d65cfbf3a36b?q=80&w=800',
            price: 'RM 3.80/bundle',
            growtime: '40-50 days'
        },
        {
            name: 'Pumpkin',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
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
            try {
                const data = await getWeatherForecast(5);
                setWeatherData(data);
            } catch (error) {
                console.error('Failed to load weather:', error);
            }
            setLoading(false);
        };

        fetchWeather();
    }, []);

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
                            <option value="Kuala Lumpur">Kuala Lumpur</option>
                            <option value="Selangor">Selangor</option>
                            <option value="Penang">Penang</option>
                            <option value="Johor">Johor</option>
                            <option value="Kelantan">Kelantan</option>
                            <option value="Terengganu">Terengganu</option>
                            <option value="Perak">Perak</option>
                            <option value="Pahang">Pahang</option>
                            <option value="Negeri Sembilan">Negeri Sembilan</option>
                            <option value="Melaka">Melaka</option>
                            <option value="Perlis">Perlis</option>
                            <option value="Kedah">Kedah</option>
                        </select>
                    </div>

                    {/* Weather Display */}
                    {loading ? (
                        <div className="text-center text-emerald-600/60 py-12 animate-pulse font-semibold">Loading weather data...</div>
                    ) : weatherData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                            {weatherData.data && weatherData.data.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-emerald-200/60 to-green-100/50 backdrop-blur-lg rounded-xl border-2 border-emerald-300/70 p-6 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-400/50 hover:from-emerald-300/70 transition-all duration-300 group cursor-pointer transform hover:scale-105 hover:-translate-y-1">
                                    <h3 className="text-emerald-800 font-bold mb-3 flex items-center gap-2">
                                        <MapPin size={18} className="text-emerald-600" />
                                        {item.location || 'Location'}
                                    </h3>
                                    <p className="text-green-900/80 text-sm group-hover:text-green-900 transition-colors">Weather forecast data available</p>
                                </div>
                            ))}
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
