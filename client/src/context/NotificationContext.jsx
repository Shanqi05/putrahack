import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    // 1. Listen to user's notifications in real-time
    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            return;
        }

        const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert ISO string back to Date object for UI
                time: new Date(doc.data().time)
            }));
            // Sort by newest first
            setNotifications(notifs.sort((a, b) => b.time - a.time));
        });

        return () => unsubscribe();
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // 2. Add notification to Firestore with anti-spam check
    const addNotification = useCallback(async (title, message, type = 'info') => {
        if (!user?.uid) return;

        // Prevent duplicate spam within 1 minute
        const isDuplicate = notifications.some(n =>
            n.title === title &&
            n.message === message &&
            (new Date() - n.time) < 60000
        );
        if (isDuplicate) return;

        try {
            await addDoc(collection(db, 'notifications'), {
                userId: user.uid,
                title,
                message,
                type,
                read: false,
                time: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error saving notification:", error);
        }
    }, [user, notifications]);

    // 3. Mark all as read in Firestore using Batch Write
    const markAllAsRead = useCallback(async () => {
        if (!user?.uid || unreadCount === 0) return;

        try {
            const batch = writeBatch(db);
            notifications.forEach(n => {
                if (!n.read) {
                    const notifRef = doc(db, 'notifications', n.id);
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