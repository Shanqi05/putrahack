import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'triplegain-secret-key-2024';

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

let db = null;
try {
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log('✓ Firebase Firestore initialized successfully');
} catch (error) {
    console.warn('⚠️ Firebase initialization warning:', error.message);
    console.log('📝 Please configure Firebase credentials in your .env file');
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// System prompt for the farmer assistant
const systemPrompt = `You are TripleGain's AI Farmer Assistant - a knowledgeable and friendly agricultural expert.
Your role is to help farmers with:
✓ Disease identification and treatment
✓ Pest management strategies
✓ Crop selection for regions/seasons
✓ Irrigation and soil health
✓ Sustainable farming practices
✓ Marketplace selling tips
✓ Weather-related decisions

Be conversational, encouraging, and practical. Reference previous messages in the conversation.
Always suggest actionable steps. Keep responses focused but warm and supportive.`;

// Initialize model without system instruction (to avoid compatibility issues)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro'
});

// All data stored in Firestore only (no in-memory storage)

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root API
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to TripleGain API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                signup: 'POST /api/auth/signup',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout'
            },
            crops: '/api/crops',
            marketplace: '/api/marketplace',
            diseases: '/api/diseases',
            leftover: '/api/leftover',
            weather: {
                alert: 'POST /api/weather/alert'
            },
            chatbot: {
                quickAsk: 'POST /api/chatbot/ask',
                conversation: 'POST /api/chatbot/chat',
                clear: 'POST /api/chatbot/clear'
            }
        }
    });
});

// ============================================
// 🔐 AUTHENTICATION ENDPOINTS
// ============================================

// Signup Endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, fullName, cropType, region, userType } = req.body;

        // Validation
        if (!email || !password || !fullName) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'password', 'fullName', 'userType']
            });
        }

        // Check if user already exists in Firestore
        if (db) {
            try {
                const userDoc = await getDoc(doc(db, 'users', email));
                if (userDoc.exists()) {
                    return res.status(409).json({
                        error: 'User already exists',
                        message: 'An account with this email already exists. Please login instead.'
                    });
                }
            } catch (firestoreError) {
                console.error('Firestore check error:', firestoreError);
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object
        const newUser = {
            id: `user_${Date.now()}`,
            email,
            password: hashedPassword,
            fullName,
            cropType: cropType || 'General',
            region: region || 'Malaysia',
            userType: userType || 'farmer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profilePicture: null,
            isVerified: false,
            loginProvider: 'email'
        };

        // Save to Firestore (ONLY storage)
        if (!db) {
            return res.status(500).json({
                error: 'Database error',
                message: 'Firebase Firestore is not initialized'
            });
        }

        try {
            await setDoc(doc(db, 'users', email), newUser);
            console.log('✅ SUCCESS: User registered in Firestore:', email);
        } catch (firestoreError) {
            console.error('❌ FIRESTORE SAVE ERROR:', firestoreError.message || firestoreError);
            return res.status(500).json({
                error: 'Failed to save user data',
                message: firestoreError.message || 'Firestore error occurred'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            status: 'success',
            message: 'Account created successfully!',
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.fullName,
                userType: newUser.userType,
                cropType: newUser.cropType,
                region: newUser.region
            },
            token,
            expiresIn: '7 days'
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({
            error: 'Failed to create account',
            message: error.message
        });
    }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing email or password',
                required: ['email', 'password', 'userType']
            });
        }

        // Fetch user from Firestore
        if (!db) {
            return res.status(500).json({
                error: 'Database error',
                message: 'Firebase Firestore is not initialized'
            });
        }

        let user = null;
        try {
            const userDoc = await getDoc(doc(db, 'users', email));
            if (userDoc.exists()) {
                user = userDoc.data();
                console.log('✅ User fetched from Firestore:', email);
            }
        } catch (firestoreError) {
            console.error('❌ Firestore fetch error:', firestoreError.message || firestoreError);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to fetch user data'
            });
        }

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Update userType if provided
        if (userType && userType !== user.userType) {
            user.userType = userType;
            user.updatedAt = new Date().toISOString();

            // Update in Firestore
            try {
                await updateDoc(doc(db, 'users', email), {
                    userType: user.userType,
                    updatedAt: user.updatedAt
                });
                console.log('✅ User type updated in Firestore:', email);
            } catch (firestoreError) {
                console.error('❌ Firestore update error:', firestoreError.message || firestoreError);
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            status: 'success',
            message: 'Login successful!',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                cropType: user.cropType,
                region: user.region,
                createdAt: user.createdAt
            },
            token,
            expiresIn: '7 days'
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            error: 'Failed to login',
            message: error.message
        });
    }
});

// Get User Profile (requires token)
app.get('/api/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Please provide a valid token in Authorization header'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch from Firestore
        if (!db) {
            return res.status(500).json({
                error: 'Database error',
                message: 'Firebase Firestore is not initialized'
            });
        }

        let user = null;
        try {
            const userDocRef = doc(db, 'users', decoded.email);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                user = userDoc.data();
                console.log('✅ Profile fetched from Firestore:', decoded.email);
            }
        } catch (firestoreError) {
            console.error('❌ Firestore fetch error:', firestoreError.message || firestoreError);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to fetch profile'
            });
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            status: 'success',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                cropType: user.cropType,
                region: user.region,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt || user.createdAt
            }
        });
    } catch (error) {
        console.error('Profile Error:', error);
        res.status(401).json({
            error: 'Invalid or expired token',
            message: error.message
        });
    }
});

// Update User Profile (requires token)
app.put('/api/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Please provide a valid token in Authorization header'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch from Firestore
        if (!db) {
            return res.status(500).json({
                error: 'Database error',
                message: 'Firebase Firestore is not initialized'
            });
        }

        let user = null;
        try {
            const userDoc = await getDoc(doc(db, 'users', decoded.email));
            if (userDoc.exists()) {
                user = userDoc.data();
                console.log('✅ User fetched from Firestore for update:', decoded.email);
            }
        } catch (firestoreError) {
            console.error('❌ Firestore fetch error:', firestoreError.message || firestoreError);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to fetch user data'
            });
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Update user fields
        const { fullName, cropType, region, userType, profilePicture } = req.body;
        
        if (fullName) user.fullName = fullName;
        if (cropType) user.cropType = cropType;
        if (region) user.region = region;
        if (userType) user.userType = userType;
        if (profilePicture) user.profilePicture = profilePicture;
        
        user.updatedAt = new Date().toISOString();

        // Update in Firestore
        try {
            await updateDoc(doc(db, 'users', decoded.email), {
                fullName: user.fullName,
                cropType: user.cropType,
                region: user.region,
                userType: user.userType,
                profilePicture: user.profilePicture,
                updatedAt: user.updatedAt
            });
            console.log('✅ Profile updated in Firestore:', decoded.email);
        } catch (firestoreError) {
            console.error('❌ Firestore update error:', firestoreError.message || firestoreError);
            return res.status(500).json({
                error: 'Failed to update profile',
                message: firestoreError.message || 'Firestore error occurred'
            });
        }

        res.json({
            status: 'success',
            message: 'Profile updated successfully!',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                cropType: user.cropType,
                region: user.region,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(401).json({
            error: 'Invalid or expired token',
            message: error.message
        });
    }
});

// Logout Endpoint (client-side)
app.post('/api/auth/logout', (req, res) => {
    // Token invalidation would be handled on client-side by removing the token
    // In production, use a token blacklist or Redis
    res.json({
        status: 'success',
        message: 'Logged out successfully. Please remove the token from localStorage.'
    });
});

// Social Login Endpoint (Google Only)
app.post('/api/auth/social-login', async (req, res) => {
    try {
        const { email, fullName, profilePicture, provider, userType } = req.body;

        // Validation
        if (!email || !provider) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'provider']
            });
        }

        // Check if user exists in Firestore
        if (!db) {
            return res.status(500).json({
                error: 'Database error',
                message: 'Firebase Firestore is not initialized'
            });
        }

        let user = null;
        let isNewUser = false;

        try {
            const userDoc = await getDoc(doc(db, 'users', email));
            if (userDoc.exists()) {
                user = userDoc.data();
                console.log(`✅ User fetched from Firestore via ${provider}:`, email);
            }
        } catch (firestoreError) {
            console.error('❌ Firestore fetch error:', firestoreError.message || firestoreError);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to fetch user data'
            });
        }

        // If user doesn't exist, create new account
        if (!user) {
            user = {
                id: `user_${Date.now()}`,
                email,
                password: null, // No password for social login
                fullName: fullName || email.split('@')[0],
                cropType: 'General',
                region: 'Malaysia',
                userType: userType || 'farmer', // Use provided userType or default to farmer
                profilePicture: profilePicture || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isVerified: true, // Social login users are verified
                loginProvider: provider
            };
            isNewUser = true;

            // Save to Firestore
            try {
                await setDoc(doc(db, 'users', email), user);
                console.log(`✅ New user created in Firestore via ${provider}:`, email);
            } catch (firestoreError) {
                console.error('❌ Firestore save error:', firestoreError.message || firestoreError);
                return res.status(500).json({
                    error: 'Failed to create account',
                    message: firestoreError.message || 'Firestore error occurred'
                });
            }
        } else {
            // Update existing user's info if provided
            let updateNeeded = false;

            if (profilePicture && !user.profilePicture) {
                user.profilePicture = profilePicture;
                updateNeeded = true;
            }

            if (userType && userType !== user.userType) {
                user.userType = userType;
                updateNeeded = true;
            }

            if (updateNeeded) {
                user.updatedAt = new Date().toISOString();

                // Update in Firestore
                try {
                    await updateDoc(doc(db, 'users', email), {
                        profilePicture: user.profilePicture,
                        userType: user.userType,
                        updatedAt: user.updatedAt
                    });
                    console.log(`✅ User updated in Firestore via ${provider}:`, email);
                } catch (firestoreError) {
                    console.error('❌ Firestore update error:', firestoreError.message || firestoreError);
                }
            }
            console.log(`✓ User logged in via ${provider}:`, email);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            status: 'success',
            message: `Login successful via ${provider}!`,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                cropType: user.cropType,
                region: user.region,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            },
            token,
            expiresIn: '7 days'
        });
    } catch (error) {
        console.error('Social Login Error:', error);
        res.status(500).json({
            error: 'Social login failed',
            message: error.message
        });
    }
});

// Routes (to be implemented)
app.get('/api/crops', (req, res) => {
    res.json({ message: 'Crops endpoint', data: [] });
});

app.get('/api/marketplace', (req, res) => {
    res.json({ message: 'Marketplace endpoint', data: [] });
});

app.get('/api/diseases', (req, res) => {
    res.json({ message: 'Disease detection endpoint', data: [] });
});

app.get('/api/leftover', (req, res) => {
    res.json({ message: 'Leftover management endpoint', data: [] });
});

// ============================================
// 🌤️ WEATHER ALERT API
// ============================================
app.post('/api/weather/alert', async (req, res) => {
    try {
        const { latitude, longitude, cropType } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                error: 'Missing latitude or longitude',
                required: ['latitude', 'longitude', 'cropType']
            });
        }

        // Fetch weather data from Open-Meteo (Free weather API)
        const weatherResponse = await axios.get(
            `https://api.open-meteo.com/v1/forecast`,
            {
                params: {
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,precipitation',
                    daily: 'precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code',
                    forecast_days: '7'
                },
                timeout: 10000
            }
        );

        const current = weatherResponse.data.current;
        const daily = weatherResponse.data.daily;

        // Generate weather alerts based on conditions
        const alerts = [];
        
        if (current.precipitation > 10) {
            alerts.push({
                level: 'warning',
                message: `Heavy rainfall expected: ${current.precipitation}mm. Check crop drainage.`,
                icon: '🌧️'
            });
        }

        if (current.wind_speed_10m > 40) {
            alerts.push({
                level: 'warning',
                message: `High wind speed: ${current.wind_speed_10m} km/h. Secure crops and protect seedlings.`,
                icon: '💨'
            });
        }

        if (current.temperature_2m > 38) {
            alerts.push({
                level: 'caution',
                message: `Heat alert: ${current.temperature_2m}°C. Increase irrigation frequency.`,
                icon: '🌡️'
            });
        }

        if (current.relative_humidity_2m < 30) {
            alerts.push({
                level: 'caution',
                message: `Low humidity: ${current.relative_humidity_2m}%. Risk of pest infestation. Monitor crops closely.`,
                icon: '💧'
            });
        }

        // Check 7-day forecast for frost risk
        if (daily.temperature_2m_min[0] < 0) {
            alerts.push({
                level: 'danger',
                message: `Frost alert! Temperature may drop to ${daily.temperature_2m_min[0]}°C. Protect sensitive crops.`,
                icon: '❄️'
            });
        }

        res.json({
            status: 'success',
            location: {
                latitude,
                longitude,
                timezone: weatherResponse.data.timezone
            },
            currentWeather: {
                temperature: `${current.temperature_2m}°C`,
                condition: current.weather_code,
                humidity: `${current.relative_humidity_2m}%`,
                windSpeed: `${current.wind_speed_10m} km/h`,
                precipitation: `${current.precipitation}mm`
            },
            sevenDayForecast: {
                dates: daily.time.slice(0, 7),
                maxTemps: daily.temperature_2m_max.slice(0, 7),
                minTemps: daily.temperature_2m_min.slice(0, 7),
                precipitation: daily.precipitation_sum.slice(0, 7)
            },
            alerts: alerts,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch weather data',
            message: error.message
        });
    }
});

// ============================================
// 🤖 AI CHATBOT API (Farmer Assistant)
// ============================================
app.post('/api/chatbot/ask', async (req, res) => {
    try {
        const { message, farmingContext = {} } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                error: 'Message is required',
                example: { message: 'How do I control pest on tomato plants?' }
            });
        }

        // Build context-aware prompt for farmer assistance
        const cropType = farmingContext.cropType || '';
        const region = farmingContext.region || '';
        const season = farmingContext.season || '';

        const systemPrompt = `You are an AI Agricultural Assistant specialized in helping farmers. 
        You provide expert advice on:
        - Crop diseases and treatments
        - Pest management and prevention
        - Irrigation and water management
        - Soil health and fertilization
        - Seasonal planting and harvesting
        - Weather-related farming decisions
        - Sustainable and organic farming practices
        - Marketplace and crop selling strategies
        
        ${cropType ? `The farmer grows: ${cropType}` : ''}
        ${region ? `Region: ${region}` : ''}
        ${season ? `Current season: ${season}` : ''}
        
        Always be helpful, practical, and encourage sustainable farming practices.
        Keep responses concise but informative. Suggest next steps when applicable.`;

        // Get AI response from Gemini
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(`${systemPrompt}\n\nFarmer's Question: ${message}`);
        const responseText = result.response.text();

        res.json({
            status: 'success',
            message: message,
            reply: responseText,
            context: {
                cropType: cropType || 'Not specified',
                region: region || 'Not specified',
                season: season || 'Not specified'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('AI Chatbot Error:', error.message);
        
        // Check if it's a quota exceeded error
        if (error.message && (error.message.includes('429') || error.message.includes('Quota exceeded'))) {
            return res.status(503).json({
                error: 'AI Service quota exceeded',
                message: 'The AI assistant is temporarily unavailable due to daily usage limits. Please try again later or upgrade your API plan.',
                isQuotaError: true,
                fallbackReply: 'I apologize! The AI is temporarily unavailable, but here are some general tips: Ensure proper crop rotation, maintain soil health with regular testing, use integrated pest management, and stay updated with local weather forecasts.'
            });
        }
        
        res.status(500).json({
            error: 'Failed to process your question',
            message: error.message || 'Please try again later'
        });
    }
});

// ============================================
// 📱 CHATBOT CONVERSATION (Multi-turn)
// ============================================
const conversations = {}; // Store conversations in memory
const CHATBOT_ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024;
const CHATBOT_ALLOWED_ATTACHMENT_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
]);

const sanitizeChatAttachment = (attachment) => {
    if (!attachment) {
        return null;
    }

    const { name, mimeType, size, data } = attachment;

    if (!name || !mimeType || !data) {
        const error = new Error('Incomplete attachment payload.');
        error.statusCode = 400;
        throw error;
    }

    if (!CHATBOT_ALLOWED_ATTACHMENT_TYPES.has(mimeType)) {
        const error = new Error('Unsupported attachment type.');
        error.statusCode = 400;
        throw error;
    }

    const parsedSize = Number(size) || 0;
    if (parsedSize > CHATBOT_ATTACHMENT_MAX_BYTES) {
        const error = new Error('Attachment exceeds the 4 MB limit.');
        error.statusCode = 400;
        throw error;
    }

    return {
        name,
        mimeType,
        size: parsedSize,
        data,
    };
};

app.post('/api/chatbot/clear', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            error: 'userId is required',
        });
    }

    delete conversations[userId];

    return res.json({
        status: 'success',
        userId,
        message: 'Chat history cleared.',
        timestamp: new Date().toISOString(),
    });
});

app.post('/api/chatbot/chat', async (req, res) => {
    try {
        const { userId, message, farmingContext = {}, attachment } = req.body;
        const sanitizedAttachment = sanitizeChatAttachment(attachment);
        const rawMessage = typeof message === 'string' ? message.trim() : '';
        const normalizedMessage = rawMessage || 'Please review this attachment and help me understand it.';

        // 1. Validation
        if (!userId || (!rawMessage && !sanitizedAttachment)) {
            return res.status(400).json({
                error: 'userId and either message or attachment are required',
            });
        }

        // 2. Initialize conversation if new user
        if (!conversations[userId]) {
            conversations[userId] = [];
        }

        // 3. Map history correctly (Gemini expects 'user' and 'model' only)
        const chatHistory = conversations[userId].map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // 4. Initialize model with proper System Instructions
        // This is much more stable than putting the prompt in history
        const chatModel = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", // Use this stable version
            systemInstruction: systemPrompt 
        });

        // 5. Start Chat with clean history
        const chat = chatModel.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.8,
            },
        });

        // 6. Send the new message
        const messageParts = [{ text: normalizedMessage }];

        if (sanitizedAttachment) {
            messageParts.push({
                inlineData: {
                    data: sanitizedAttachment.data,
                    mimeType: sanitizedAttachment.mimeType,
                },
            });
        }

        const result = await chat.sendMessage(messageParts);
        const assistantReply = result.response.text();

        // 7. Update the local conversation memory
        const messageSummary = sanitizedAttachment
            ? `${normalizedMessage}\n\nAttached file: ${sanitizedAttachment.name} (${sanitizedAttachment.mimeType}, ${sanitizedAttachment.size} bytes)`
            : normalizedMessage;

        conversations[userId].push(
            { role: 'user', text: messageSummary },
            { role: 'model', text: assistantReply }
        );

        // Limit history to 20 items (10 turns) to prevent token bloat
        if (conversations[userId].length > 20) {
            conversations[userId] = conversations[userId].slice(-20);
        }

        // 8. Success Response
        res.json({
            status: 'success',
            userId,
            reply: assistantReply,
            attachmentAccepted: Boolean(sanitizedAttachment),
            farmingContext: {
                cropType: farmingContext.cropType || 'Not specified',
                region: farmingContext.region || 'Not specified',
                season: farmingContext.season || 'Not specified'
            },
            conversationLength: conversations[userId].length / 2,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Multi-turn Chat Error:', error.message);

        if (error.statusCode === 400) {
            return res.status(400).json({
                error: 'Invalid attachment',
                message: error.message,
            });
        }
        
        // Error Handling for Quota (429)
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            return res.status(503).json({
                error: 'AI Service quota exceeded',
                message: 'The AI assistant is temporarily unavailable. Please try again in a few minutes.',
                isQuotaError: true
            });
        }
        
        // Error Handling for Configuration/Model (404)
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return res.status(500).json({
                error: 'AI Model configuration error',
                message: 'The AI model is not properly configured. Check your model name and API key.',
                isConfigError: true
            });
        }
        
        res.status(500).json({
            error: 'Failed to process your message',
            message: error.message || 'Internal Server Error'
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════╗
║   TripleGain API Server Running    ║
║   🌱 Protecting Crops, Growing    ║
║   Port: ${PORT}                       ║
╚═══════════════════════════════════╝
  `);
});

export default app;
