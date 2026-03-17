// Authentication Service - TripleGain Backend
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

// Helper to build API URLs - uses Vite proxy in development, direct URL in production
const getApiUrl = (endpoint) => {
    return `https://triplegain-api.onrender.com/api${endpoint}`;
};

// Store token in localStorage
const setToken = (token) => {
    localStorage.setItem("triplegain_token", token);
};

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem("triplegain_token");
};

// Remove token from localStorage
const removeToken = () => {
    localStorage.removeItem("triplegain_token");
};

// Signup API
export const signup = async (email, password, fullName, userType = "farmer", cropType = "", region = "") => {
    try {
        const response = await fetch(getApiUrl("/auth/signup"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                fullName,
                userType,
                cropType,
                region,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Signup failed");
        }

        const data = await response.json();

        // Store token
        if (data.token) {
            setToken(data.token);
        }

        return {
            status: "success",
            user: data.user,
            token: data.token,
        };
    } catch (error) {
        console.error("Signup Error:", error);
        throw error;
    }
};

// Login API
export const login = async (email, password, userType = "farmer") => {
    try {
        const response = await fetch(getApiUrl("/auth/login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                userType,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Login failed");
        }

        const data = await response.json();

        // Store token
        if (data.token) {
            setToken(data.token);
        }

        return {
            status: "success",
            user: data.user,
            token: data.token,
        };
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

// Google Sign In
export const loginWithGoogle = async (userType = "farmer") => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Get Firebase ID token
        const token = await user.getIdToken();

        // Send to backend for verification and user creation/update
        const response = await fetch(getApiUrl("/auth/social-login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                idToken: token,
                provider: "google",
                email: user.email,
                fullName: user.displayName,
                profilePicture: user.photoURL,
                userType,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Google login failed");
        }

        const data = await response.json();

        // Store token
        if (data.token) {
            setToken(data.token);
        }

        return {
            status: "success",
            user: data.user,
            token: data.token,
        };
    } catch (error) {
        console.error("Google Login Error:", error);
        throw error;
    }
};

// Get User Profile
export const getUserProfile = async () => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error("No token found. Please login.");
        }

        const response = await fetch(getApiUrl("/auth/profile"), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch profile");
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error("Get Profile Error:", error);
        throw error;
    }
};

// Update User Profile
export const updateProfile = async (updates) => {
    try {
        const token = getToken();

        if (!token) {
            throw new Error("No token found. Please login.");
        }

        const response = await fetch(getApiUrl("/auth/profile"), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update profile");
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error("Update Profile Error:", error);
        throw error;
    }
};

// Logout
export const logout = async () => {
    try {
        const token = getToken();

        const response = await fetch(getApiUrl("/auth/logout"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        // Remove token regardless of response
        removeToken();

        return { status: "success" };
    } catch (error) {
        console.error("Logout Error:", error);
        // Still remove token on error
        removeToken();
        throw error;
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Get auth header for API requests
export const getAuthHeader = () => {
    const token = getToken();
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }
    return {
        "Content-Type": "application/json",
    };
};
