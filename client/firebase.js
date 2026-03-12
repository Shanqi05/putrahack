// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);