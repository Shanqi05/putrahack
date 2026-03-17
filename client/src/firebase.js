import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Use your actual TripleGain Firebase config here
const firebaseConfig = {
    apiKey: "AIzaSyAka62DwD1FvawfYxHndBML7GSb8ocL1Lk",
    authDomain: "triplegain-afb8c.firebaseapp.com",
    projectId: "triplegain-afb8c",
    storageBucket: "triplegain-afb8c.firebasestorage.app",
    messagingSenderId: "537179349283",
    appId: "1:537179349283:web:4458e4e054ac77eaf56c96",
    measurementId: "G-3VSE8J4E7J"
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);
} catch (error) {
    console.warn('⚠️ Firebase initialization warning:', error.message);
}

// Initialize and configure providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Export everything so your components can use them
export { app, auth, db, storage, googleProvider };
export default app;