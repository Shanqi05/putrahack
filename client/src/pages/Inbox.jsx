import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Clock, MessageCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Inbox = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef(null);

    const currentUserId = user?.uid || user?.id || user?._id || user?.email;

    useEffect(() => {
        if (!currentUserId) return;

        const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const myMsgs = allMsgs.filter(m => m.senderId === currentUserId || m.receiverId === currentUserId);
            setMessages(myMsgs);

            const convos = {};
            myMsgs.forEach(msg => {
                const isMeSender = msg.senderId === currentUserId;
                const otherId = isMeSender ? msg.receiverId : msg.senderId;
                const otherName = isMeSender ? msg.receiverName : msg.senderName;

                const unreadCount = (!isMeSender && msg.read === false) ? 1 : 0;

                // 获取最后一条消息的简短描述
                let shortLastMessage = msg.message;
                if (msg.type === "product_card") {
                    const cleanName = msg.productDetails?.name?.replace(' (Clearance)', '') || 'Product';
                    shortLastMessage = `[Inquiry about ${cleanName}]`;
                }

                if (!convos[otherId]) {
                    convos[otherId] = {
                        id: otherId,
                        otherId,
                        otherName,
                        lastMessage: shortLastMessage,
                        timestamp: msg.timestamp,
                        unread: unreadCount
                    };
                } else {
                    convos[otherId].lastMessage = shortLastMessage;
                    convos[otherId].timestamp = msg.timestamp;
                    convos[otherId].unread += unreadCount;
                }
            });

            const sortedConvos = Object.values(convos).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setConversations(sortedConvos);

            if (!activeChat && sortedConvos.length > 0) {
                setActiveChat(sortedConvos[0]);
            }
        });

        return () => unsubscribe();
    }, [currentUserId, activeChat]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChat]);

    useEffect(() => {
        if (!activeChat || !currentUserId) return;

        const markAsRead = async () => {
            const unreadMsgs = messages.filter(m =>
                m.receiverId === currentUserId &&
                m.senderId === activeChat.otherId &&
                m.read === false
            );

            for (const msg of unreadMsgs) {
                await updateDoc(doc(db, "messages", msg.id), { read: true });
            }
        };

        markAsRead();
    }, [activeChat, messages, currentUserId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const senderName = user?.fullName || user?.displayName || user?.email?.split('@')[0] || "Me";

            await addDoc(collection(db, "messages"), {
                senderId: currentUserId,
                senderName: senderName,
                receiverId: activeChat.otherId,
                receiverName: activeChat.otherName,
                type: "text",
                message: newMessage,
                timestamp: new Date().toISOString(),
                read: false
            });

            setNewMessage("");
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    const currentChatMessages = messages.filter(m =>
        m.senderId === activeChat?.otherId || m.receiverId === activeChat?.otherId
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-10 px-6">
            <div className="max-w-6xl mx-auto flex flex-col h-[85vh]">

                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all group"
                    >
                        <ArrowLeft size={24} className="text-slate-600 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Messages <span className="text-emerald-600">Center</span>
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-1">

                    {/* Left Panel */}
                    <div className="w-1/3 border-r border-slate-100 bg-slate-50/50 flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-white">
                            <h2 className="text-2xl font-black text-slate-800">Active Chats</h2>
                            <p className="text-slate-500 text-sm font-medium">Your connections</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {conversations.length === 0 ? (
                                <p className="text-center text-slate-400 mt-10 text-sm font-medium">No messages yet.</p>
                            ) : (
                                conversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setActiveChat(conv)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all relative ${activeChat?.id === conv.id ? 'bg-emerald-500 shadow-md text-white' : 'bg-white hover:bg-slate-100 text-slate-800'}`}
                                    >
                                        {conv.unread > 0 && activeChat?.id !== conv.id && (
                                            <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                                                {conv.unread}
                                            </span>
                                        )}
                                        <div className="flex justify-between items-start mb-1 pr-6">
                                            <h4 className={`font-bold text-sm ${activeChat?.id === conv.id ? 'text-white' : 'text-slate-900'}`}>{conv.otherName}</h4>
                                            <span className={`text-[10px] ${activeChat?.id === conv.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${activeChat?.id === conv.id ? 'text-emerald-50' : 'text-slate-500 font-medium'}`}>
                                            {conv.lastMessage}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="w-2/3 flex flex-col bg-white">
                        {activeChat ? (
                            <>
                                <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-4 shadow-sm z-10">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">{activeChat.otherName}</h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
                                    {currentChatMessages.map((msg, idx) => {
                                        const isMe = msg.senderId === currentUserId;

                                        // Render Product Card
                                        if (msg.type === "product_card") {
                                            const isLeftover = msg.productDetails?.source === 'leftover' || msg.productDetails?.name?.includes('(Clearance)');
                                            const cleanProductName = msg.productDetails?.name?.replace(' (Clearance)', '') || 'Product';

                                            return (
                                                <div key={idx} className={`flex flex-col w-full mb-6 ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm w-64 hover:shadow-md transition-shadow relative overflow-hidden">

                                                        <div className={`absolute top-4 left-4 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm z-10 ${isLeftover ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                                            {isLeftover ? 'From Leftover' : 'From Market'}
                                                        </div>

                                                        <img
                                                            src={msg.productDetails?.image || "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80"}
                                                            alt={cleanProductName}
                                                            className="w-full h-32 object-cover rounded-xl mb-3 relative z-0"
                                                        />
                                                        <div className="px-1">
                                                            <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{cleanProductName}</h4>
                                                            <p className="text-emerald-600 font-black flex items-center gap-1">
                                                                <ShoppingBag size={14} /> RM {msg.productDetails?.price} <span className="text-xs text-slate-400 font-bold">/kg</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                        <Clock size={10} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        // Render Normal Text
                                        return (
                                            <div key={idx} className={`flex flex-col w-full mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                                                    {msg.message}
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-4 bg-white border-t border-slate-100">
                                    <form onSubmit={handleSend} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="bg-emerald-500 text-white px-6 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 font-bold shadow-md"
                                        >
                                            <Send size={18} /> Send
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                <MessageCircle size={64} className="mb-4 text-slate-200" />
                                <p className="font-bold text-lg text-slate-600">No chat selected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inbox;