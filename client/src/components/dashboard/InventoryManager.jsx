import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit2, X, Image as ImageIcon } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const InventoryManager = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track if we are editing

    // Form state
    const [newItem, setNewItem] = useState({
        name: '', quantity: '', price: '', description: '', image: ''
    });

    useEffect(() => {
        if (user) fetchInventory();
    }, [user]);

    const fetchInventory = async () => {
        try {
            const activeUserId = user?.uid || user?.id || user?._id || user?.email;
            if (!activeUserId) return;

            const q = query(collection(db, "inventory"), where("userId", "==", activeUserId));
            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInventory(items);
        } catch (error) {
            console.error("Fetch inventory error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle image upload and convert to Base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem({ ...newItem, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Open modal for editing existing item
    const openEditModal = (item) => {
        setNewItem({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            description: item.description || '',
            image: item.image || ''
        });
        setEditingId(item.id);
        setShowAddModal(true);
    };

    // Reset form and close modal
    const closeModal = () => {
        setNewItem({ name: '', quantity: '', price: '', description: '', image: '' });
        setEditingId(null);
        setShowAddModal(false);
    };

    // Handle Add or Update
    const handleSaveItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.quantity || !newItem.price) {
            alert("Please fill in Name, Quantity, and Price!");
            return;
        }

        try {
            const activeUserId = user?.uid || user?.id || user?._id || user?.email;
            const farmerName = user?.fullName || user?.displayName || user?.email?.split('@')[0] || "Local Farmer";
            const region = user?.region || "Selangor, Malaysia";

            const itemData = {
                userId: activeUserId,
                farmerName: farmerName,
                location: region,
                name: newItem.name,
                quantity: Number(newItem.quantity),
                price: Number(newItem.price),
                description: newItem.description,
                image: newItem.image || "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80",
                updatedAt: new Date().toISOString()
            };

            if (editingId) {
                // Update existing item
                await updateDoc(doc(db, "inventory", editingId), itemData);
                setInventory(inventory.map(item => item.id === editingId ? { id: editingId, ...itemData } : item));
                addNotification("Inventory Updated", `${newItem.name} details have been updated.`, "success");
            } else {
                // Add new item
                const docRef = await addDoc(collection(db, "inventory"), itemData);
                setInventory([...inventory, { id: docRef.id, ...itemData }]);
                addNotification("Inventory Added", `${newItem.name} is now listed on the Market.`, "success");
            }

            closeModal();
        } catch (error) {
            console.error("Save item error:", error);
            alert("Failed to save inventory.");
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await deleteDoc(doc(db, "inventory", id));
            setInventory(inventory.filter(item => item.id !== id));
            addNotification("Item Removed", "Removed from inventory and market.", "info");
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full flex flex-col relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-emerald-950">
                    <Package size={20} className="text-emerald-500" />
                    <h3 className="font-black text-lg">My Inventory</h3>
                </div>
                <button
                    onClick={() => { closeModal(); setShowAddModal(true); }}
                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors shadow-sm"
                >
                    <Plus size={18} strokeWidth={3} />
                </button>
            </div>

            {/* Modal for Add / Edit */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-emerald-950">
                                {editingId ? "Edit Inventory" : "Add to Inventory"}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-red-500 bg-slate-100 p-2 rounded-full">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div className="relative border-2 border-dashed border-emerald-200 rounded-2xl p-4 text-center hover:bg-emerald-50 transition-colors overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                {newItem.image ? (
                                    <img src={newItem.image} alt="Preview" className="h-24 mx-auto rounded-lg object-cover relative z-0" />
                                ) : (
                                    <div className="text-emerald-600 flex flex-col items-center">
                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                        <span className="text-sm font-bold">Upload Crop Photo</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Crop Name (e.g. Tomato)" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium" required />

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">RM</span>
                                    <input type="number" step="0.1" placeholder="Price/kg" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 font-medium" required />
                                </div>

                                <div className="relative">
                                    <input type="number" placeholder="Quantity" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-10 outline-none focus:ring-2 focus:ring-emerald-500 font-medium" required />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kg</span>
                                </div>

                                <textarea placeholder="Short description..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium h-24 resize-none" />
                            </div>

                            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 mt-2">
                                {editingId ? "Save Changes" : "List on Marketplace"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Inventory Table */}
            <div className="overflow-x-auto flex-1 mt-2">
                {inventory.length === 0 ? (
                    <div className="text-center py-10">
                        <Package size={40} className="mx-auto text-emerald-100 mb-3" />
                        <p className="text-slate-400 font-medium text-sm">No items yet. Click + to add.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                            <th className="pb-3 font-bold">Item</th>
                            <th className="pb-3 font-bold">Price</th>
                            <th className="pb-3 font-bold">Stock</th>
                            <th className="pb-3 font-bold text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {inventory.map(item => (
                            <tr key={item.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 font-bold text-emerald-600 text-sm">RM {item.price}</td>
                                <td className="py-3 font-medium text-slate-600 text-sm">{item.quantity} kg</td>
                                <td className="py-3 text-right">
                                    {/* 🌟 Added Edit Button */}
                                    <button onClick={() => openEditModal(item)} className="text-slate-300 hover:text-emerald-500 transition-colors p-1 mr-1">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default InventoryManager;