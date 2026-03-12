# TripleGain Backend API Guide

## 🚀 Backend Features Implemented

Your server now has two powerful farmer-focused features:

### 1. 🌤️ Weather Alert API
**Status:** ✅ **FULLY WORKING**

#### Endpoint
```
POST /api/weather/alert
Content-Type: application/json
```

#### Request Body
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "cropType": "Wheat"
}
```

#### Response Example
```json
{
  "status": "success",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone": "GMT"
  },
  "currentWeather": {
    "temperature": "25.6°C",
    "condition": 3,
    "humidity": "60%",
    "windSpeed": "4.5 km/h",
    "precipitation": "0mm"
  },
  "sevenDayForecast": {
    "dates": ["2026-03-12", "2026-03-13", ...],
    "maxTemps": [35.9, 31.9, ...],
    "minTemps": [20.6, 19.2, ...],
    "precipitation": [0, 0, ...]
  },
  "alerts": [
    {
      "level": "warning",
      "message": "Heavy rainfall expected: 10mm. Check crop drainage.",
      "icon": "🌧️"
    }
  ],
  "timestamp": "2026-03-12T16:14:15.133Z"
}
```

#### Alert Types
- **🌧️ Heavy Rain**: If precipitation > 10mm
- **💨 High Wind**: If wind speed > 40 km/h
- **🌡️ Heat Alert**: If temperature > 38°C
- **💧 Low Humidity**: If humidity < 30%
- **❄️ Frost Alert**: If tomorrow's min temp < 0°C

#### Test in Terminal
```powershell
$body = @{latitude=28.6139; longitude=77.2090; cropType="Wheat"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/api/weather/alert -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

---

### 2. 🤖 AI Chatbot API
**Status:** ⚠️ **NEEDS API KEY CONFIGURATION**

The chatbot is fully coded and ready. You just need a valid Google Generative AI API key.

#### Get Your API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create New API Key"
3. Copy the key
4. Update `server/.env`:
```env
GOOGLE_AI_API_KEY=your_new_api_key_here
```
5. Restart the server

#### Endpoints

**A) Single Question (Quick Ask)**
```
POST /api/chatbot/ask
Content-Type: application/json

{
  "message": "How do I control pest on tomato plants?",
  "farmingContext": {
    "cropType": "Tomato",
    "region": "Delhi",
    "season": "Summer"
  }
}
```

**B) Multi-turn Conversation**
```
POST /api/chatbot/chat
Content-Type: application/json

{
  "userId": "farmer123",
  "message": "What crops can I grow in winter?",
  "farmingContext": {
    "cropType": "Wheat",
    "region": "Punjab",
    "season": "Winter"
  }
}
```

#### Response Example
```json
{
  "status": "success",
  "userId": "farmer123",
  "message": "How do I control pest on tomato plants?",
  "reply": "To control common tomato pests, you can use several methods:\n\n1. **Neem Oil Spray**...",
  "farmingContext": {
    "cropType": "Tomato",
    "region": "Delhi",
    "season": "Summer"
  },
  "conversationLength": 1,
  "timestamp": "2026-03-12T16:20:00.000Z"
}
```

#### Chatbot Features
✓ Specializes in agricultural advice
✓ Knows crop diseases & treatments
✓ Pest management strategies
✓ Irrigation & soil health advice
✓ Sustainable farming practices
✓ Marketplace selling tips
✓ Context-aware responses
✓ Conversation history (multi-turn)

---

## 📡 Frontend Integration

### Weather Alert Integration
```javascript
// In your React component (Home.jsx)
const fetchWeatherAlert = async (latitude, longitude, cropType) => {
  const response = await fetch('http://localhost:5000/api/weather/alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, cropType })
  });
  return response.json();
};
```

### Chatbot Integration
```javascript
// In AIChatbot.jsx
const sendChatMessage = async (userId, message, farmingContext) => {
  const response = await fetch('http://localhost:5000/api/chatbot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message, farmingContext })
  });
  return response.json();
};
```

---

## 🔧 Server Setup Checklist

- [x] Express server running on port 5000
- [x] CORS enabled for local development
- [x] Weather API integrated with Open-Meteo
- [x] .env configuration created
- [x] Chatbot code implemented with Gemini
- [ ] **Get valid Google Generative AI API key**
- [ ] Test chatbot after API key updated
- [ ] Update frontend to call endpoints
- [ ] Deploy to production

---

## 🚨 Troubleshooting

**Weather endpoint returns error?**
- Check if coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Make sure you have internet connection

**Chatbot says "API key not valid"?**
- Generate new key at https://aistudio.google.com/app/apikey
- Copy-paste exactly (no extra spaces)
- Restart server after updating .env

**Port 5000 already in use?**
- Change PORT in .env file
- Or kill the process: `lsof -i :5000` on Mac/Linux

---

## 📞 API Endpoints Summary

```
GET  /api/health                    - Server health check
GET  /api                           - List all endpoints
POST /api/weather/alert             - Get weather & alerts ✅
POST /api/chatbot/ask               - Quick AI question
POST /api/chatbot/chat              - Multi-turn chat conversation
```

Happy farming! 🌾
