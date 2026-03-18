import React, { useState, useEffect } from "react";
import { Search, MapPin, Tag, MessageCircle, Leaf, Filter, X, Send } from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const malaysiaStates = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
    "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak",
    "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"
];

const Marketplace = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [priceFilter, setPriceFilter] = useState("all");
    const [stateFilter, setStateFilter] = useState("all"); // 🌟 新增 State Filter

    const [contactModal, setContactModal] = useState(null);
    const [messageText, setMessageText] = useState("");

    const currentUserId = user?.uid || user?.id || user?._id || user?.email;

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const snapshot = await getDocs(collection(db, "inventory"));
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(items);
            } catch (error) {
                console.error("Error fetching market data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMarketData();
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        try {
            const senderName = user?.fullName || user?.displayName || user?.email?.split('@')[0] || "A Buyer";
            const baseTime = new Date().getTime();

            await addDoc(collection(db, "messages"), {
                senderId: currentUserId,
                senderName: senderName,
                receiverId: contactModal.userId,
                receiverName: contactModal.farmerName,
                type: "product_card",
                productDetails: {
                    name: contactModal.name,
                    price: contactModal.price,
                    image: contactModal.image || "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80",
                    source: "market"
                },
                timestamp: new Date(baseTime).toISOString(),
                read: false
            });

            await addDoc(collection(db, "messages"), {
                senderId: currentUserId,
                senderName: senderName,
                receiverId: contactModal.userId,
                receiverName: contactModal.farmerName,
                type: "text",
                message: messageText,
                timestamp: new Date(baseTime + 1000).toISOString(),
                read: false
            });

            addNotification("Message Sent! ✉️", `Inquiry sent to ${contactModal.farmerName}.`, "success", false);
            setContactModal(null);
            setMessageText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.farmerName?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesPrice = true;
        if (priceFilter === "under10") matchesPrice = p.price < 10;
        if (priceFilter === "10to50") matchesPrice = p.price >= 10 && p.price <= 50;
        if (priceFilter === "over50") matchesPrice = p.price > 50;

        let matchesState = true;
        if (stateFilter !== "all") {
            matchesState = p.location?.toLowerCase().includes(stateFilter.toLowerCase());
        }

        return matchesSearch && matchesPrice && matchesState;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                            Fresh <span className="text-emerald-600">Market</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Wholesale sourcing from verified Malaysian farmers.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-11 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-bold text-slate-700 appearance-none cursor-pointer"
                            >
                                <option value="all">All Prices</option>
                                <option value="under10">Under RM 10</option>
                                <option value="10to50">RM 10 - RM 50</option>
                                <option value="over50">Over RM 50</option>
                            </select>
                        </div>

                        {/* 🌟 新增的 State Filter */}
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={stateFilter}
                                onChange={(e) => setStateFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-11 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-bold text-slate-700 appearance-none cursor-pointer"
                            >
                                <option value="all">All States</option>
                                {malaysiaStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search crops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-[2.5rem]" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => {
                            const isOwner = product.userId === currentUserId;

                            return (
                                <div key={product.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">

                                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                                        <img
                                            src={product.image || "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-xl font-black text-slate-800 line-clamp-1">{product.name}</h3>
                                            <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
                                                {product.quantity} kg avail.
                                            </div>
                                        </div>

                                        <div className="mb-4 flex items-end gap-1">
                                            <span className="text-3xl font-black text-emerald-600 leading-none">RM {product.price}</span>
                                            <span className="text-sm font-bold text-slate-400 uppercase mb-0.5">/ kg</span>
                                        </div>

                                        <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2 flex-1">
                                            {product.description || "Freshly harvested high-quality crops. Ready for delivery."}
                                        </p>

                                        <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                                                    <Leaf size={12} />
                                                </div>
                                                <span className="truncate">{product.farmerName || "Local Farmer"}</span>
                                            </div>
                                            <div className="flex items-center text-slate-400 text-xs font-bold">
                                                <MapPin size={12} className="mr-1" /> <span className="truncate">{product.location || "Malaysia"}</span>
                                            </div>
                                        </div>

                                        {isOwner ? (
                                            <div className="w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-inner">
                                                <Tag size={18} /> Your Listing
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setContactModal(product)}
                                                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle size={18} /> Contact Farmer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 mt-8">
                        <Tag size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">No crops found</h3>
                        <p className="text-slate-400">Try adjusting your filters or search term.</p>
                    </div>
                )}
            </div>

            {contactModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-black text-slate-900">Send Inquiry</h2>
                            <button onClick={() => setContactModal(null)} className="text-slate-400 hover:text-red-500 bg-slate-100 p-2 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="bg-emerald-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                            <img src={contactModal.image || "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80"} alt="crop" className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                                <p className="font-bold text-emerald-900 text-sm">To: {contactModal.farmerName}</p>
                                <p className="text-xs text-emerald-600 font-medium">Regarding: {contactModal.name} ({contactModal.quantity}kg)</p>
                            </div>
                        </div>

                        <form onSubmit={handleSendMessage}>
                            <textarea
                                placeholder={`Hi ${contactModal.farmerName}, I am interested in buying your ${contactModal.name}...`}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium h-32 resize-none mb-4 text-slate-700"
                                required
                            />
                            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2">
                                <Send size={18} /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;