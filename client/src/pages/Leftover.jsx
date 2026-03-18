import React, { useState, useEffect } from 'react';
import { Leaf, Tag, MapPin, Phone, CheckCircle, ImagePlus, Clock, Edit, Trash2, Send, X, Loader, Search, Filter } from 'lucide-react';
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

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        cropType: '', weight: '', price: '',
        condition: 'Ugly but Good to Eat', state: 'Penang', area: 'Simpang Ampat', image: null
    });

    const [surplusMarket, setSurplusMarket] = useState([]);
    const [contactModal, setContactModal] = useState({ isOpen: false, item: null, message: '' });

    const [searchTerm, setSearchTerm] = useState('');
    const [conditionFilter, setConditionFilter] = useState('All');

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
            (item.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCondition = conditionFilter === 'All' || item.condition === conditionFilter;
        return matchesSearch && matchesCondition;
    });

    const handleStateChange = (e) => {
        const newState = e.target.value;
        setFormData({
            ...formData,
            state: newState,
            area: malaysiaLocations[newState][0]
        });
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
                crop: formData.cropType, weight: formData.weight, price: formData.price,
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
            setIsEditing(false);
            setEditId(null);
            setFormData({ cropType: '', weight: '', price: '', condition: 'Ugly but Good to Eat', state: 'Penang', area: 'Simpang Ampat', image: null });
        } catch (error) {
            console.error("Error saving: ", error);
            addNotification("Error", "Failed to save listing.", "error", false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnlist = async (item) => {
        if(window.confirm('Are you sure you want to unlist this item?')) {
            try {
                await deleteDoc(doc(db, 'leftoverMarket', item.id));
                setSurplusMarket(surplusMarket.filter(i => i.id !== item.id));
                addNotification("Deal Removed 🗑️", item.crop, "info", false);
            } catch (error) {
                console.error("Error deleting: ", error);
                addNotification("Error", "Failed to unlist item.", "error", false);
            }
        }
    };

    const handleEditClick = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setFormData({
            cropType: item.crop, weight: item.weight, price: item.price,
            condition: item.condition, state: item.state, area: item.area, image: item.image
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6 font-sans relative">
            <div className="max-w-7xl mx-auto">

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold text-sm mb-4">
                        <Leaf size={18} /> Zero Waste Market
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                        Clearance & <span className="text-blue-600">Surplus</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        List your imperfect crops. Local restaurants, juice makers, and livestock farmers are looking for nearby deals!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-fit overflow-hidden">
                        <div className={`p-5 text-white ${isEditing ? 'bg-gradient-to-r from-blue-700 to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {isEditing ? <Edit size={22} /> : <Tag size={22} />}
                                {isEditing ? 'Edit Your Listing' : 'Post a Clearance Deal'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">Upload Photo</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 overflow-hidden relative">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
                                            <p className="text-sm text-slate-500 font-semibold">Click to upload photo</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Crop Name</label>
                                <input type="text" required placeholder="e.g. Tomatoes" value={formData.cropType} onChange={(e) => setFormData({...formData, cropType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none font-medium" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Weight (kg)</label>
                                    <input type="number" required placeholder="e.g. 50" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Price (RM/kg)</label>
                                    <input type="number" step="0.1" required placeholder="e.g. 1.50" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Crop Condition</label>
                                <select value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-700">
                                    <option>Ugly but Good to Eat</option>
                                    <option>Too Ripe (Good for Sauce/Juice)</option>
                                    <option>For Animal Feed / Compost</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">State</label>
                                    <select value={formData.state} onChange={handleStateChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-700">
                                        {Object.keys(malaysiaLocations).map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Area</label>
                                    <select value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium text-slate-700">
                                        {malaysiaLocations[formData.state].map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2 pt-2">
                                {isEditing && (
                                    <button type="button" onClick={() => {setIsEditing(false); setFormData({ cropType: '', weight: '', price: '', condition: 'Ugly but Good to Eat', state: 'Penang', area: 'Simpang Ampat', image: null })}} className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 rounded-xl transition-all">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" disabled={isSubmitting} className={`flex-1 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}>
                                    {isSubmitting ? <><Loader className="animate-spin" size={18}/> Saving...</> : (isEditing ? 'Update Listing' : 'List Item')}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-7 space-y-5">

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                Nearby Deals
                                <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm ml-2">
                                    {filteredMarket.length} found
                                </span>
                            </h3>

                            <div className="flex w-full sm:w-auto gap-2">
                                <div className="relative group flex-1 sm:w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search crop, area..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                    />
                                </div>
                                <div className="relative group">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select
                                        value={conditionFilter}
                                        onChange={(e) => setConditionFilter(e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Conditions</option>
                                        <option value="Ugly but Good to Eat">Ugly but Good to Eat</option>
                                        <option value="Too Ripe (Good for Sauce/Juice)">Too Ripe</option>
                                        <option value="For Animal Feed / Compost">Animal Feed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isLoadingData ? (
                            <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-500" size={40} /></div>
                        ) : filteredMarket.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-500">
                                <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="text-lg font-bold text-slate-600">No listings found</p>
                                <p className="text-sm mt-1">Try adjusting your search or filter.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {filteredMarket.map((item) => {
                                    const isMyPost = item.sellerEmail === currentUserEmail;

                                    return (
                                        <div key={item.id} className={`bg-white p-4 sm:p-5 rounded-3xl border shadow-sm transition-all flex flex-col sm:flex-row gap-5 ${isMyPost ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 hover:shadow-md'}`}>

                                            <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                                                {isMyPost && <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm z-10">My Post</div>}
                                                <img src={item.image} alt={item.crop} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-xl font-black text-slate-800">{item.crop}</h4>
                                                            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                                                <MapPin size={14} className="text-red-500" />
                                                                <span className="font-medium">{item.area}, {item.state}</span>
                                                            </div>
                                                            <p className="text-xs font-semibold text-slate-400 mt-1">By {item.sellerName}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black text-emerald-600 leading-none">RM {item.price}</div>
                                                            <div className="text-xs font-bold text-slate-400 uppercase mt-1">per kg</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">
                                                            📦 {item.weight} kg available
                                                        </span>
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                                                            item.condition.includes('Animal') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {item.condition}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                                        <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                                    </div>

                                                    {isMyPost ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEditClick(item)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                            <button onClick={() => handleUnlist(item)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                                                                <Trash2 size={14} /> Unlist
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => openContactModal(item)} className="bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-md">
                                                            <Phone size={14} /> Contact Farmer
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
                </div>
            </div>

            {contactModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-xl text-slate-900">Contact {contactModal.item.sellerName}</h3>
                            <button onClick={() => setContactModal({isOpen: false, item: null, message: ''})} className="text-slate-400 hover:text-red-500 bg-slate-100 p-2 rounded-full transition-colors">
                                <X size={18}/>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-emerald-50 rounded-xl p-3 flex gap-3 items-center">
                                <img src={contactModal.item.image} alt="crop" className="w-12 h-12 rounded-lg object-cover" />
                                <div>
                                    <p className="font-bold text-emerald-900 text-sm">Regarding: {contactModal.item.crop} ({contactModal.item.weight}kg)</p>
                                    <p className="text-emerald-600 font-bold text-xs mt-0.5">Listed at RM {contactModal.item.price} / kg</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Your Message</label>
                                <textarea
                                    rows="4"
                                    value={contactModal.message}
                                    onChange={(e) => setContactModal({...contactModal, message: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-medium text-slate-700"
                                ></textarea>
                            </div>

                            <button onClick={handleSendMessage} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
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