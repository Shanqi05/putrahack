// Authentication Service - TripleGain Backend
// Helper to build API URLs - uses Vite proxy in development, direct URL in production
const getApiUrl = (endpoint) => {
    if (import.meta.env.PROD) {
        return `http://localhost:5000/api${endpoint}`;
    } else {
        return `/api${endpoint}`;
    }
};

// Store token in localStorage
const setToken = (token) => {
    localStorage.setItem('triplegain_token', token);
};

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('triplegain_token');
};

// Remove token from localStorage
const removeToken = () => {
    localStorage.removeItem('triplegain_token');
};

// Signup API
export const signup = async (email, password, fullName, userType = 'farmer', cropType = '', region = '') => {
    try {
        const response = await fetch(getApiUrl('/auth/signup'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                fullName,
                userType,
                cropType,
                region
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        const data = await response.json();
        
        // Store token
        if (data.token) {
            setToken(data.token);
        }

        return {
            status: 'success',
            user: data.user,
            token: data.token
        };
    } catch (error) {
        console.error('Signup Error:', error);
        throw error;
    }
};

// Login API
export const login = async (email, password) => {
    try {
        const response = await fetch(getApiUrl('/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        
        // Store token
        if (data.token) {
            setToken(data.token);
        }

        return {
            status: 'success',
            user: data.user,
            token: data.token
        };
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
};

// Get User Profile
export const getUserProfile = async () => {
    try {
        const token = getToken();
        
        if (!token) {
            throw new Error('No token found. Please login.');
        }

        const response = await fetch(getApiUrl('/auth/profile'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Get Profile Error:', error);
        throw error;
    }
};

// Update User Profile
export const updateProfile = async (updates) => {
    try {
        const token = getToken();
        
        if (!token) {
            throw new Error('No token found. Please login.');
        }

        const response = await fetch(getApiUrl('/auth/profile'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Update Profile Error:', error);
        throw error;
    }
};

// Logout
export const logout = async () => {
    try {
        const token = getToken();
        
        const response = await fetch(getApiUrl('/auth/logout'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Remove token regardless of response
        removeToken();

        return { status: 'success' };
    } catch (error) {
        console.error('Logout Error:', error);
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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
    return {
        'Content-Type': 'application/json'
    };
};
