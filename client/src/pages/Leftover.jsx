import React, { useState, useEffect } from 'react';
import { Leaf, Tag, MapPin, Phone, CheckCircle, ImagePlus, Clock, Edit, Trash2, Send, X, Loader, Search, Filter, Plus, Info, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const malaysiaLocations = {
    "Johor": ["Johor Bahru", "Batu Pahat", "Kluang", "Kulai", "Muar", "Segamat"],
    "Kedah": ["Sungai Petani", "Alor Setar", "Kulim", "Kuah", "Baling"],
    "Kelantan": ["Kota Bharu", "Pasir Mas", "Tumpat", "Tanah Merah"],
    "Melaka": ["Melaka City", "Alor Gajah", "Ayer Keroh", "Jasin"],
    "Negeri Sembilan": ["Seremban", "Port Dickson", "Nilai", "Tampin"],
    "Pahang": ["Kuantan", "Temerloh", "Bentong", "Mentakab", "Cameron Highlands"],
    "Penang": ["Simpang Ampat", "George Town", "Butterworth", "Bukit Mertajam", "Bayan Lepas", "Batu Kawan", "Nibong Tebal", "Kepala Batas"],
    "Perak": ["Ipoh", "Taiping", "Sitiawan", "Teluk Intan", "Seri Manjung"],
    "Perlis": ["Kangar", "Arau", "Padang Besar"],
    "Sabah": ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu"],
    "Sarawak": ["Kuching", "Miri", "Sibu", "Bintulu"],
    "Selangor": ["Petaling Jaya", "Shah Alam", "Subang Jaya", "Klang", "Puchong", "Kajang", "Rawang", "Cyberjaya"],
    "Terengganu": ["Kuala Terengganu", "Kemaman", "Dungun", "Besut"],
    "W.P. Kuala Lumpur": ["Kuala Lumpur", "Cheras", "Kepong", "Setapak", "Wangsa Maju"],
    "W.P. Labuan": ["Victoria"],
    "W.P. Putrajaya": ["Putrajaya"]
};

const Leftover = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const currentUserId = user?.uid || user?.id || user?._id || user?.email;
    const currentUserEmail = user?.email || 'demo_farmer@triplegain.com';
    const currentUserName = user?.fullName || 'Demo Farmer';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        cropType: '', weight: '', originalPrice: '', price: '',
        condition: 'Ugly but Good to Eat', state: 'Penang', area: 'Simpang Ampat', image: null
    });

    const [surplusMarket, setSurplusMarket] = useState([]);
    const [contactModal, setContactModal] = useState({ isOpen: false, item: null, message: '' });

    const [searchTerm, setSearchTerm] = useState('');
    const [conditionFilter, setConditionFilter] = useState('All');
    const [stateFilter, setStateFilter] = useState('All');
    const [areaFilter, setAreaFilter] = useState('All');

    const fetchMarketData = async () => {
        try {
            const q = query(collection(db, 'leftoverMarket'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setSurplusMarket(items);
        } catch (error) {
            console.error("Error fetching market data: ", error);
            addNotification("Error", "Failed to load market data.", "error", false);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
    }, []);

    const filteredMarket = surplusMarket.filter(item => {
        const matchesSearch = (item.crop || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCondition = conditionFilter === 'All' || item.condition === conditionFilter;
        const matchesState = stateFilter === 'All' || item.state === stateFilter;
        const matchesArea = areaFilter === 'All' || item.area === areaFilter;

        return matchesSearch && matchesCondition && matchesState && matchesArea;
    });

    const handleStateChange = (e) => {
        const newState = e.target.value;
        setFormData({
            ...formData,
            state: newState,
            area: malaysiaLocations[newState][0]
        });
    };

    const handleFilterStateChange = (e) => {
        setStateFilter(e.target.value);
        setAreaFilter('All');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scaleSize = 800 / img.width;
                    canvas.width = 800;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    setFormData({ ...formData, image: canvas.toDataURL('image/jpeg', 0.7) });
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const itemData = {
                crop: formData.cropType,
                weight: formData.weight,
                originalPrice: formData.originalPrice || formData.price,
                price: formData.price,
                condition: formData.condition, state: formData.state, area: formData.area,
                image: formData.image || 'https://images.unsplash.com/photo-1595856342813-f47053e1f0e9?w=400&q=80',
                sellerId: currentUserId,
                sellerEmail: currentUserEmail,
                sellerName: currentUserName,
            };

            if (isEditing) {
                await updateDoc(doc(db, 'leftoverMarket', editId), itemData);
                addNotification("Listing Updated! ✏️", formData.cropType, "success", false);
            } else {
                itemData.createdAt = new Date().toISOString();
                itemData.time = 'Just now';
                await addDoc(collection(db, 'leftoverMarket'), itemData);
                addNotification("Deal Posted! 📝", formData.cropType, "success", false);
            }

            await fetchMarketData();
            setIsFormOpen(false);
            setIsEditing(false);
            setEditId(null);
            setFormData({ cropType: '', weight: '', originalPrice: '', price: '', condition: 'Ugly but Good to Eat', state: 'Penang', area: 'Simpang Ampat', image: null });
        } catch (error) {
            console.error("Error saving: ", error);
            addNotification("Error", "Failed to save listing.", "error", false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnlist = async (item) => {
        if (window.confirm('Are you sure you want to unlist this item?')) {
            try {
                await deleteDoc(doc(db, 'leftoverMarket', item.id));
                setSurplusMarket(surplusMarket.filter(i => i.id !== item.id));
                addNotification("Deal Removed 🗑️", item.crop, "info", false);
            } catch (error) {
                console.error("Error deleting: ", error);
            }
        }
    };

    const handleEditClick = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            cropType: item.crop, weight: item.weight,
            originalPrice: item.originalPrice || '',
            price: item.price,
            condition: item.condition, state: item.state, area: item.area, image: item.image
        });
        setIsFormOpen(true);
    };

    const openContactModal = (item) => {
        setContactModal({
            isOpen: true, item: item,
            message: `Hi ${item.sellerName},\n\nI am interested in buying your ${item.weight}kg of ${item.crop} listed at RM${item.price}/kg. Is it still available?`
        });
    };

    const handleSendMessage = async () => {
        if (!contactModal.message.trim() || !contactModal.item) return;

        try {
            const senderName = currentUserName || "A Buyer";
            const receiverId = contactModal.item.sellerId || contactModal.item.sellerEmail;
            const baseTime = new Date().getTime();

            await addDoc(collection(db, "messages"), {
                senderId: currentUserId,
                senderName: senderName,
                receiverId: receiverId,
                receiverName: contactModal.item.sellerName,
                type: "product_card",
                productDetails: {
                    name: contactModal.item.crop,
                    price: contactModal.item.price,
                    image: contactModal.item.image || "https://images.unsplash.com/photo-1595856342813-f47053e1f0e9?w=400&q=80",
                    source: "leftover"
                },
                timestamp: new Date(baseTime).toISOString(),
                read: false
            });

            await addDoc(collection(db, "messages"), {
                senderId: currentUserId,
                senderName: senderName,
                receiverId: receiverId,
                receiverName: contactModal.item.sellerName,
                type: "text",
                message: contactModal.message,
                timestamp: new Date(baseTime + 1000).toISOString(),
                read: false
            });

            addNotification("Message Sent! ✉️", `Inquiry sent to ${contactModal.item.sellerName}.`, "success", false);
            setContactModal({ isOpen: false, item: null, message: '' });
        } catch (error) {
            console.error("Error sending message:", error);
            addNotification("Error", "Failed to send message.", "error", false);
        }
    };

    const getConditionStyle = (condition) => {
        if (condition.includes('Animal')) return 'bg-orange-500/90 text-white';
        if (condition.includes('Ripe')) return 'bg-rose-500/90 text-white';
        return 'bg-amber-500/90 text-white';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6 font-sans relative">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10">

                    <div className="w-full xl:w-1/2 shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black text-xs uppercase tracking-widest mb-2 mt-2">
                            <Leaf size={12} /> Zero Waste Initiative
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            Clearance & <span className="text-emerald-600">Leftover</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm max-w-lg">
                            Turn ugly crops and surplus into profit. Local buyers are looking for nearby deals!
                        </p>
                    </div>

                    <div className="w-full xl:w-auto flex flex-col xl:items-end gap-4">
                        <button
                            onClick={() => { setIsFormOpen(true); setIsEditing(false); setFormData({ cropType: '', weight: '', originalPrice: '', price: '', condition: 'Ugly but Good to Eat', state: 'Penang', area: 'Simpang Ampat', image: null }); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 text-sm w-full sm:w-auto"
                        >
                            <Plus size={16} strokeWidth={3} /> Post Leftover
                        </button>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search crop..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative group">
                                <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select
                                    value={conditionFilter}
                                    onChange={(e) => setConditionFilter(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-700 appearance-none cursor-pointer transition-all shadow-sm"
                                >
                                    <option value="All">All Conditions</option>
                                    <option value="Ugly but Good to Eat">Ugly but Good to Eat</option>
                                    <option value="Too Ripe (Good for Sauce/Juice)">Too Ripe</option>
                                    <option value="For Animal Feed / Compost">Animal Feed</option>
                                </select>
                            </div>

                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select
                                    value={stateFilter}
                                    onChange={handleFilterStateChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-700 appearance-none cursor-pointer transition-all shadow-sm"
                                >
                                    <option value="All">All States</option>
                                    {Object.keys(malaysiaLocations).map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select
                                    value={areaFilter}
                                    onChange={(e) => setAreaFilter(e.target.value)}
                                    disabled={stateFilter === 'All'}
                                    className={`w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-700 appearance-none transition-all shadow-sm ${stateFilter === 'All' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <option value="All">All Areas</option>
                                    {stateFilter !== 'All' && malaysiaLocations[stateFilter].map(area => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-[2.5rem]" />)}
                    </div>
                ) : filteredMarket.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center text-slate-500 mt-4">
                        <Tag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-xl font-bold text-slate-700">No surplus listings found</p>
                        <p className="text-sm font-medium mt-1">Adjust your filters or be the first to list!</p>
                    </div>
                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredMarket.map((item) => {
                            const isMyPost = item.sellerEmail === currentUserEmail;

                            const origPrice = parseFloat(item.originalPrice);
                            const salePrice = parseFloat(item.price);
                            let discountPercent = 0;
                            if (origPrice && salePrice && origPrice > salePrice) {
                                discountPercent = Math.round(((origPrice - salePrice) / origPrice) * 100);
                            }

                            return (
                                <div key={item.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col relative">

                                    {discountPercent > 0 && (
                                        <div className="absolute top-5 right-5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1 animate-pulse z-20">
                                            <TrendingDown size={14} /> {discountPercent}% OFF
                                        </div>
                                    )}

                                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.crop}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                        {isMyPost && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm tracking-widest uppercase">
                                                    My Post
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 left-4 z-10">
                                            <span className={`${getConditionStyle(item.condition)} backdrop-blur-md border border-white/20 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1`}>
                                                <Tag size={10} /> {item.condition}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">

                                        {/* 🌟 标题与重量 */}
                                        <div className="flex justify-between items-start mb-3 gap-3">
                                            <h4 className="text-2xl font-black text-slate-800 truncate flex-1">{item.crop}</h4>
                                        </div>

                                        {/* 🌟 极致防御的 Location 与 Date 布局 (不再被挤压) */}
                                        <div className="flex items-center justify-between gap-3 text-slate-500 text-xs font-medium mb-4">
                                            <div className="flex items-center gap-1 min-w-0 flex-1">
                                                <MapPin size={14} className="text-emerald-500 shrink-0" />
                                                <span className="truncate">{item.area}, {item.state}</span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 text-slate-400 font-bold text-[10px]">
                                                <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex flex-col mb-4">
                                            {discountPercent > 0 && (
                                                <span className="text-[11px] font-bold text-slate-400 line-through decoration-slate-400/60 mb-0.5">
                                                    Orig. RM {item.originalPrice}
                                                </span>
                                            )}
                                            <div className="flex items-end gap-1">
                                                <span className="text-3xl font-black text-emerald-600 leading-none">RM {item.price}</span>
                                                <span className="text-xs font-bold text-slate-400 uppercase mb-0.5">/ kg</span>
                                            </div>
                                        </div>

                                        {/* 🌟 重量标签下移，避免顶部打架 */}
                                        <div className="flex flex-wrap items-center gap-2 mb-5">
                                            <span className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-inner">
                                                📦 {item.weight} kg avail.
                                            </span>
                                        </div>

                                        {/* Footer (Farmer and Actions) */}
                                        <div className="mt-auto pt-5 border-t border-slate-100 space-y-4">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                    <Leaf size={12} />
                                                </div>
                                                <span className="truncate text-xs font-bold text-slate-600">{item.sellerName}</span>
                                            </div>

                                            {isMyPost ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditClick(item)} className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 text-xs font-bold px-4 py-2.5 rounded-xl flex-1 flex items-center justify-center gap-1.5 transition-colors">
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                    <button onClick={() => handleUnlist(item)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => openContactModal(item)} className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:shadow-emerald-600/30">
                                                    <Phone size={16} /> Contact Farmer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 relative flex flex-col max-h-[90vh]">
                        <div className={`p-6 text-white shrink-0 ${isEditing ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    {isEditing ? <Edit size={24} /> : <Tag size={24} />}
                                    {isEditing ? 'Edit Your Listing' : 'Post Clearance Deal'}
                                </h2>
                                <button onClick={() => { setIsFormOpen(false); setIsEditing(false); }} className="text-white/80 hover:text-white transition-colors bg-black/10 p-2 rounded-full hover:bg-black/20">
                                    <X size={20}/>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-8">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">Upload Photo</label>
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 overflow-hidden relative transition-colors">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                                                <ImagePlus className="w-10 h-10 mb-3 text-emerald-500/50" />
                                                <p className="text-sm font-bold text-slate-600">Click to upload crop photo</p>
                                                <p className="text-xs font-medium mt-1">JPEG or PNG</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Crop Name</label>
                                    <input type="text" required placeholder="e.g. Ugly Tomatoes" value={formData.cropType} onChange={(e) => setFormData({...formData, cropType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold text-slate-800 transition-all" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Weight (kg)</label>
                                    <input type="number" required placeholder="e.g. 50" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                </div>

                                <div className="grid grid-cols-2 gap-5 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Original Market Price <span className="text-xs font-medium text-slate-400">(Optional)</span></label>
                                        <input type="number" step="0.1" placeholder="e.g. 5.00" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-emerald-700">Clearance Price</label>
                                        <input type="number" step="0.1" required placeholder="e.g. 1.50" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-white border-2 border-emerald-300 rounded-xl px-4 py-3.5 outline-none font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Crop Condition</label>
                                    <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-emerald-500/50 transition-all">
                                        <option>Ugly but Good to Eat</option>
                                        <option>Too Ripe (Good for Sauce/Juice)</option>
                                        <option>For Animal Feed / Compost</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">State</label>
                                        <select value={formData.state} onChange={handleStateChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-emerald-500/50 transition-all">
                                            {Object.keys(malaysiaLocations).map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Area</label>
                                        <select value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-emerald-500/50 transition-all">
                                            {malaysiaLocations[formData.state].map(area => (
                                                <option key={area} value={area}>{area}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => {setIsFormOpen(false); setIsEditing(false);}} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className={`flex-1 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'}`}>
                                        {isSubmitting ? <><Loader className="animate-spin" size={18}/> Saving...</> : (isEditing ? 'Update Listing' : 'Post Clearance')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {contactModal.isOpen && (
                <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl text-slate-900">Contact {contactModal.item.sellerName}</h3>
                            <button onClick={() => setContactModal({isOpen: false, item: null, message: ''})} className="text-slate-400 hover:text-red-500 bg-slate-100 p-2 rounded-full transition-colors">
                                <X size={18}/>
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="bg-emerald-50 rounded-2xl p-4 flex gap-4 items-center border border-emerald-100">
                                <img src={contactModal.item.image} alt="crop" className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                                <div>
                                    <p className="font-bold text-emerald-950 text-sm mb-0.5">{contactModal.item.crop} <span className="text-emerald-600 opacity-80">({contactModal.item.weight}kg)</span></p>
                                    <p className="text-emerald-700 font-black text-xs">RM {contactModal.item.price} / kg</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Your Message</label>
                                <textarea
                                    rows="4"
                                    value={contactModal.message}
                                    onChange={(e) => setContactModal({...contactModal, message: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none font-medium text-slate-700"
                                ></textarea>
                            </div>

                            <button onClick={handleSendMessage} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30">
                                <Send size={18} /> Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leftover;