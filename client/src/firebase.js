import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ IMPORTANT: Replace these with your actual Firebase config
// Get your config from: https://console.firebase.google.com
// Project Settings → Your apps → Web app → Firebase SDK snippet

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEMOKEY123REPLACETHIS",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "triplegain-demo.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "triplegain-demo",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "triplegain-demo.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123def456"
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.warn('⚠️ Firebase initialization warning:', error.message);
    console.log('📝 Please configure your Firebase credentials in src/firebase.js');
}

// Initialize providers
const googleProvider = new GoogleAuthProvider();

// Configure providers
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { app, auth, db, storage, googleProvider };
export default app;
