import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'triplegain-secret-key-2024';

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

// In-memory user storage (in production, use MongoDB/Firebase)
const users = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
                conversation: 'POST /api/chatbot/chat'
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

        // Check if user already exists
        if (users.has(email)) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'An account with this email already exists. Please login instead.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user
        const newUser = {
            id: `user_${Date.now()}`,
            email,
            password: hashedPassword,
            fullName,
            cropType: cropType || 'General',
            region: region || 'Malaysia',
            userType: userType || 'farmer', // 'farmer' or 'buyer'
            createdAt: new Date().toISOString(),
            profilePicture: null,
            isVerified: false
        };

        users.set(email, newUser);

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
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing email or password',
                required: ['email', 'password']
            });
        }

        // Find user
        const user = users.get(email);
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
app.get('/api/auth/profile', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Please provide a valid token in Authorization header'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.get(decoded.email);

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
                createdAt: user.createdAt
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

// Logout Endpoint (client-side)
app.post('/api/auth/logout', (req, res) => {
    // Token invalidation would be handled on client-side by removing the token
    // In production, use a token blacklist or Redis
    res.json({
        status: 'success',
        message: 'Logged out successfully. Please remove the token from localStorage.'
    });
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

app.post('/api/chatbot/chat', async (req, res) => {
    try {
        const { userId, message, farmingContext = {} } = req.body;

        // 1. Validation
        if (!userId || !message || message.trim() === '') {
            return res.status(400).json({
                error: 'userId and message are required',
            });
        }

        // 2. Initialize conversation if new user
        if (!conversations[userId]) {
            conversations[userId] = [];
        }

        // 3. Map history correctly (Gemini expects 'user' and 'model' only)
        const chatHistory = conversations[userId].map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
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
        const result = await chat.sendMessage(message);
        const assistantReply = result.response.text();

        // 7. Update the local conversation memory
        conversations[userId].push(
            { role: 'user', text: message },
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
