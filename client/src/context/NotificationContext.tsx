import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    time: Date;
}

interface ToastPopup {
    id: number;
    title: string;
    message: string;
    type: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type?: string, saveToDb?: boolean) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [popups, setPopups] = useState<ToastPopup[]>([]);

    const activeUserId = user?.uid || user?.id || user?._id || user?.email;

    useEffect(() => {
        if (!activeUserId) {
            setNotifications([]);
            return;
        }

        const q = query(collection(db, "notifications"), where("userId", "==", activeUserId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                time: new Date(d.data().time),
            })) as Notification[];
            setNotifications(notifs.sort((a, b) => b.time.getTime() - a.time.getTime()));
        });

        return () => unsubscribe();
    }, [activeUserId]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const addNotification = useCallback(
        async (title: string, message: string, type = "info", saveToDb = true) => {
            const currentUserId = user?.uid || user?.id || user?._id || user?.email;

            const popupId = Date.now();
            setPopups(prev => [...prev, { id: popupId, title, message, type }]);

            setTimeout(() => {
                setPopups(prev => prev.filter(p => p.id !== popupId));
            }, 3000);

            if (!currentUserId || !saveToDb) return;

            const isDuplicate = notifications.some(
                (n) => n.title === title && n.message === message && Date.now() - n.time.getTime() < 60000,
            );
            if (isDuplicate) return;

            try {
                await addDoc(collection(db, "notifications"), {
                    userId: currentUserId,
                    title,
                    message,
                    type,
                    read: false,
                    time: new Date().toISOString(),
                });
            } catch (error) {
                console.error("Error saving notification:", error);
            }
        },
        [user, notifications],
    );

    const markAllAsRead = useCallback(async () => {
        if (!activeUserId || unreadCount === 0) return;

        try {
            const batch = writeBatch(db);
            notifications.forEach((n) => {
                if (!n.read) {
                    const notifRef = doc(db, "notifications", n.id);
                    batch.update(notifRef, { read: true });
                }
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    }, [activeUserId, notifications, unreadCount]);

    const getPopupStyle = (type: string) => {
        switch(type) {
            case 'success': return 'bg-emerald-50 border-emerald-500 text-emerald-800';
            case 'error': return 'bg-red-50 border-red-500 text-red-800';
            default: return 'bg-blue-50 border-blue-500 text-blue-800';
        }
    };

    const getPopupIcon = (type: string) => {
        switch(type) {
            case 'success': return <CheckCircle className="text-emerald-500" size={24} />;
            case 'error': return <AlertCircle className="text-red-500" size={24} />;
            default: return <Info className="text-blue-500" size={24} />;
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead }}>
            {children}
            <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {popups.map(popup => (
                    <div
                        key={popup.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-l-4 shadow-xl shadow-slate-200/50 w-80 transform transition-all animate-in slide-in-from-right-8 fade-in duration-300 ${getPopupStyle(popup.type)}`}
                    >
                        {getPopupIcon(popup.type)}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-base mb-0.5 text-slate-800">{popup.message}</h4>
                            <p className="text-xs font-bold opacity-80">{popup.title}</p>
                        </div>
                        <button
                            onClick={() => setPopups(prev => prev.filter(p => p.id !== popup.id))}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};