import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

        if (!userId || !message || message.trim() === '') {
            return res.status(400).json({
                error: 'userId and message are required',
                example: { userId: 'user123', message: 'What crops can I grow in winter?' }
            });
        }

        // Initialize conversation if new user
        if (!conversations[userId]) {
            conversations[userId] = [];
        }

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

        // Build chat with history
        const chat = model.startChat({
            history: conversations[userId].map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.8,
            },
        });

        // Send new message
        const result = await chat.sendMessage(message);
        const assistantReply = result.response.text();

        // Store conversation history
        conversations[userId].push(
            { role: 'user', text: message },
            { role: 'model', text: assistantReply }
        );

        // Keep conversation history limited to last 10 exchanges
        if (conversations[userId].length > 20) {
            conversations[userId] = conversations[userId].slice(-20);
        }

        res.json({
            status: 'success',
            userId,
            message: message,
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
        res.status(500).json({
            error: 'Failed to process your message',
            message: error.message || 'Please try again later'
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
