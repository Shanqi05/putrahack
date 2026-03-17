import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    time: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type?: string) => Promise<void>;
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

    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            return;
        }

        const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                time: new Date(d.data().time),
            })) as Notification[];
            setNotifications(notifs.sort((a, b) => b.time.getTime() - a.time.getTime()));
        });

        return () => unsubscribe();
    }, [user]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const addNotification = useCallback(
        async (title: string, message: string, type = "info") => {
            if (!user?.uid) return;

            const isDuplicate = notifications.some(
                (n) => n.title === title && n.message === message && Date.now() - n.time.getTime() < 60000,
            );
            if (isDuplicate) return;

            try {
                await addDoc(collection(db, "notifications"), {
                    userId: user.uid,
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
        if (!user?.uid || unreadCount === 0) return;

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
    }, [user, notifications, unreadCount]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
