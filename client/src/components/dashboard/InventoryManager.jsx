import React, { useState, useEffect } from "react";
import { Package, Plus, Trash2, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useNotification } from "../../context/NotificationContext.js";


const baseMarketPrices = {
    "Durian Musang King": 55.0,
    "Palm Oil": 3.8,
    Chili: 12.0,
    Tomato: 4.5,
    Cucumber: 3.0,
    "Banana (Cavendish)": 3.5,
    "Rice Paddy": 1.5,
    Rubber: 6.2,
};


const getSimulatedMarketPrice = (cropName) => {
    const base = baseMarketPrices[cropName] || 5.0; // 找不到的作物默认 5.0
    const fluctuation = Math.random() * 0.1 - 0.05;
    const currentPrice = (base * (1 + fluctuation)).toFixed(2);
    const trend = fluctuation >= 0 ? "up" : "down";
    const difference = Math.abs(base * fluctuation).toFixed(2);

    return { price: currentPrice, trend, difference };
};

const InventoryManager = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);


    const [newItemName, setNewItemName] = useState("");

    const { addNotification } = useNotification();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const snapshot = await getDocs(collection(db, "inventory"));
            const items = snapshot.docs.map((doc) => {
                const data = doc.data();
                const marketData = getSimulatedMarketPrice(data.name);
                return { id: doc.id, ...data, marketData };
            });
            setInventory(items);
        } catch (error) {
            console.error("Fetch inventory error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();


        if (!newItemName.trim()) {
            alert("Please type a crop name!");
            return;
        }

        try {
            const newItem = {
                name: newItemName,
                quantity: 0,
                updatedAt: new Date().toISOString(),
            };

            const docRef = await addDoc(collection(db, "inventory"), newItem);
            const marketData = getSimulatedMarketPrice(newItem.name);

            setInventory([...inventory, { id: docRef.id, ...newItem, marketData }]);
            setNewItemName("");


            addNotification("Inventory Updated", `${newItemName} added to list.`, "success");
        } catch (error) {
            console.error("Add item error:", error);
            alert("Failed to add inventory: " + error.message);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await deleteDoc(doc(db, "inventory", id));
            setInventory(inventory.filter((item) => item.id !== id));
            addNotification("Item Deleted", "Crop removed from inventory.", "info");
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleUpdateQuantity = async (id, newQuantity) => {
        try {
            await updateDoc(doc(db, "inventory", id), { quantity: Number(newQuantity) });
            setInventory(inventory.map((item) => (item.id === id ? { ...item, quantity: Number(newQuantity) } : item)));
            setEditingId(null);
            addNotification("Stock Updated", "Inventory quantity adjusted.", "success");
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-emerald-950">
                    <Package size={20} className="text-emerald-500" />
                    <h3 className="font-black text-lg">My Inventory</h3>
                </div>
            </div>

            <form
                onSubmit={handleAddItem}
                className="flex gap-4 mb-6 bg-gray-50 p-3 rounded-full border border-gray-200 shadow-sm"
            >
                <input
                    type="text"
                    placeholder="Type any crop name..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="flex-1 bg-white border-none rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
                <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={18} /> Add
                </button>
            </form>

            {/* Inventory Table */}
            {loading ? (
                <p className="text-center text-gray-500 py-4 animate-pulse">Loading inventory...</p>
            ) : (
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b-2 border-gray-100 text-gray-400 text-sm">
                            <th className="pb-3 font-medium">Crop Name</th>
                            <th className="pb-3 font-medium">Stock (kg)</th>
                            <th className="pb-3 font-medium">Est. Price</th>
                            <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {inventory.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50 hover:bg-emerald-50/50 transition-colors">
                                <td className="py-4 font-bold text-emerald-950">{item.name}</td>
                                <td className="py-4">
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            defaultValue={item.quantity}
                                            onBlur={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUpdateQuantity(item.id, e.target.value)}
                                            className="w-20 border-2 border-emerald-500 rounded-lg px-2 py-1 focus:outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            className="text-gray-700 font-medium cursor-pointer hover:text-emerald-600"
                                            onClick={() => setEditingId(item.id)}
                                        >
                        {item.quantity} kg <Edit2 size={12} className="inline ml-1 opacity-50" />
                      </span>
                                    )}
                                </td>
                                <td className="py-4">
                                    <div className="flex flex-col">
                                        <span className="font-black text-emerald-950">RM {item.marketData?.price}</span>
                                        <span
                                            className={`text-[10px] flex items-center font-bold mt-1 w-fit px-2 py-0.5 rounded-md ${item.marketData?.trend === "up" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}
                                        >
                        {item.marketData?.trend === "up" ? (
                            <TrendingUp size={10} className="mr-1" />
                        ) : (
                            <TrendingDown size={10} className="mr-1" />
                        )}
                                            {item.marketData?.difference}
                      </span>
                                    </div>
                                </td>
                                <td className="py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {inventory.length === 0 && (
                        <div className="text-center py-10">
                            <Package size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-500 font-medium">Your inventory is empty.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
