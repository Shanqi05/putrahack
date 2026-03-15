# TripleGain 🌱

**AI-Powered Agriculture Platform** - Protecting Crops, Growing Prosperity

## 🎯 Overview

TripleGain is a comprehensive platform that combines:
- **AI Disease Detection** - Early warning systems for crop diseases
- **Smart Marketplace** - Direct farmer-to-consumer connections
- **Leftover Management** - Zero-waste crop redistribution
- **Community Support** - Farmer collaboration and knowledge sharing
- **AI Chatbot Assistant** - 24/7 agricultural advisor powered by Google Gemini

## 📖 Documentation Quick Links

👥 **New Team Member?** → Read [SETUP_FOR_TEAMMATES.md](./SETUP_FOR_TEAMMATES.md) (10 min setup!)
🤖 **Setup AI Chatbot?** → Read [CHATBOT_SETUP.md](./CHATBOT_SETUP.md)
🔐 **Auth System?** → Read [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
🔥 **Firebase Setup?** → Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Choose your path:**
- ⚡ I just want to run the code → [SETUP_FOR_TEAMMATES.md](./SETUP_FOR_TEAMMATES.md)
- 👨‍💻 I want to understand everything → Start with [README.md](./README.md) (this file)
- 🚀 I'm ready to deploy → Jump to "Building for Production" section

## 📁 Project Structure

```
putrahack/
├── client/                      # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AIChatbot.jsx       # AI Assistant Chat Widget
│   │   │   ├── layout/
│   │   │   │   └── Header.jsx          # Navigation with Auth
│   │   │   ├── market/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Beautiful Homepage
│   │   │   ├── DiseaseDetection.jsx    # Disease Detection
│   │   │   ├── Marketplace.jsx         # Buy/Sell Products
│   │   │   ├── Leftover.jsx            # Waste Management
│   │   │   ├── Login.jsx               # Authentication
│   │   │   ├── Signup.jsx              # Registration
│   │   │   └── Profile.jsx             # User Profile
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── firebase.js             # Firebase Config
│   │   │   └── weather.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
│
├── server/                      # Node.js Express API
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── FIREBASE_SETUP.md            # Firebase Configuration Guide
└── README.md                    # This file
```

## 🎨 Design Features

### Color Scheme (Green Gradient)
- **Primary**: Deep Emerald (#064E3B)
- **Secondary**: Vibrant Green (#10B981)
- **Accent**: Lime Green (#BEF264)
- **Gradient**: `linear-gradient(135deg, #064E3B 0%, #065F46 45%, #10B981 100%)`

### UI Components
- Modern glassmorphism header with navigation
- Animated hero section with gradient background
- Responsive feature cards with hover effects
- Beautiful CTAs and statistics display
- Mobile-friendly design

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16 or higher - [Download](https://nodejs.org/)
- **npm** v10+ (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Google AI API Key** (for AI Chatbot) - [Get here](https://makersuite.google.com/app/apikey)

### ⚡ QUICKEST START (2 Terminals)

If you just want to run everything quickly:

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:3001
```

**Open:** http://localhost:3001 in your browser! 🎉

---

### 📝 DETAILED SETUP FOR TEAMMATES

#### **Step 1️⃣: Clone & Navigate**
```bash
# Clone the repository
git clone <repository-url>
cd putrahack

# Check structure
ls -la  # On Mac/Linux
dir     # On Windows
```

#### **Step 2️⃣: Backend Setup**

```bash
# Navigate to server folder
cd server

# Install ALL dependencies
npm install

# Check if all installed correctly
npm list
```

**Backend Dependencies:**
- `express` - Web server framework
- `cors` - Allow frontend to call backend
- `dotenv` - Environment variables
- `jsonwebtoken` - User authentication
- `bcryptjs` - Password hashing
- `@google/generative-ai` - AI Chatbot engine
- `axios` - HTTP requests
- `firebase-admin` - Firebase connection

**Create .env file in `/server` folder:**
```bash
# server/.env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here-change-in-production
GOOGLE_AI_API_KEY=your-google-ai-key-here
```

**Get your Google AI Key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste in `.env` as `GOOGLE_AI_API_KEY`

**Start Backend:**
```bash
# Development mode (auto-restart on changes)
npm run dev

# OR production mode
npm start
```

Check: http://localhost:5000/api/health should show green ✅

#### **Step 3️⃣: Frontend Setup**

```bash
# Navigate to client folder
cd client

# Install ALL dependencies
npm install

# Check if all installed correctly
npm list
```

**Frontend Dependencies:**
- `react` - UI library
- `react-dom` - React browser rendering
- `react-router-dom` - Page navigation
- `lucide-react` - Beautiful icons
- `firebase` - Authentication & database
- `tailwindcss` - Styling framework
- `vite` - Super fast build tool

**Start Frontend:**
```bash
# Development mode
npm run dev
```

Frontend opens automatically at: http://localhost:3001 🚀

#### **Step 4️⃣: Verify Everything Works**

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   # Should show: {"status": "Server is running", ...}
   ```

2. **Frontend loads:**
   - Open http://localhost:3001
   - Should see homepage with TripleGain logo

3. **Try signup:**
   - Click "Sign Up" button
   - Fill form and create account
   - Should see navigation links appear in header

4. **Try AI Chatbot:**
   - Click chat bubble (bottom right)
   - Type a farming question
   - AI should respond

---

### 📦 Full Installation Command (Copy-Paste)

**Windows (PowerShell):**
```powershell
# Backend
cd server; npm install; npm start

# (Open NEW PowerShell window for frontend)
cd client; npm install; npm run dev
```

**Mac/Linux (Bash):**
```bash
# Backend
cd server && npm install && npm start &

# Frontend (in new terminal)
cd client && npm install && npm run dev
```

---

### 🏗️ Project Structure After Setup

```
putrahack/
├── client/                    # React Frontend + Vite
│   ├── node_modules/         # All frontend dependencies
│   ├── src/
│   ├── package.json          # Frontend config
│   └── package-lock.json     # Locked dependency versions
│
├── server/                    # Express Backend API
│   ├── node_modules/         # All backend dependencies
│   ├── index.js              # Main server file
│   ├── .env                  # Your API keys (CREATE THIS!)
│   ├── package.json          # Backend config
│   └── package-lock.json     # Locked dependency versions
│
├── README.md                 # This file
└── ...other files
```

### 📦 Building for Production

**Frontend:**
```bash
cd client
npm run build
# Creates: client/dist/
# Ready to deploy to Vercel, Netlify, etc.
```

**Backend:**
```bash
cd server
NODE_ENV=production npm start
# Ready to deploy to Heroku, Railway, etc.
```

### 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **npm install stuck/slow** | Use `npm cache clean --force` then retry |
| **Port 5000 already in use** | Change `PORT` in server/.env or kill process |
| **Port 3001 already in use** | Vite will try 3002, 3003, etc automatically |
| **"GOOGLE_AI_API_KEY not found"** | Create server/.env with your Google AI key |
| **Frontend won't load** | Clear browser cache: `Ctrl+Shift+Delete` |
| **Backend shows 502 error** | Check backend terminal for error messages |
| **Can't login/signup** | Backend must be running on port 5000 |
| **Chatbot not responding** | Verify `GOOGLE_AI_API_KEY` is in server/.env |

**Common Error Fixes:**
```bash
# Fix 1: Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install

# Fix 2: Update npm
npm install -g npm@latest

# Fix 3: Check Node version
node --version  # Should be v16+
npm --version   # Should be v10+
```

## 📋 Features Implemented

### Authentication & User Management ✅
- [x] User registration (Signup page)
- [x] Email/Password login
- [x] User profile management
- [x] Role selection (Farmer / Buyer)
- [x] Firebase Authentication integration
- [x] Protected routes

### Homepage ✅
- [x] Beautiful green gradient hero section
- [x] Horizontal scroll through 4 service pages
- [x] Statistics dashboard
- [x] Feature cards with icons
- [x] Weather alert integration
- [x] Crop marketplace gallery
- [x] Smooth animations and transitions
- [x] Responsive design

### Marketplace ✅
- [x] Browse and filter products
- [x] Product cards with farmer info
- [x] Star ratings and reviews
- [x] Purchase functionality
- [x] Wishlist support
- [x] Search and filter by region

### Disease Detection ✅
- [x] Image upload interface
- [x] Disease detection features
- [x] Disease database with accuracy metrics
- [x] Treatment recommendations
- [x] Historical tracking

### Leftover Management ✅
- [x] Surplus product listings
- [x] Waste reduction tracking
- [x] Environmental impact metrics
- [x] Farmer tools for listing extras
- [x] Bulk buyer connections

### AI Chatbot Assistant 🤖✅
- [x] Floating chat widget
- [x] Context-aware responses
- [x] Disease & farming Q&A
- [x] Marketplace tips
- [x] Quick action buttons
- [x] Message timestamps
- [x] Beautiful glassmorphism UI

### Header Navigation ✅
- [x] Responsive navigation menu
- [x] Auth status display
- [x] User profile link
- [x] Logout functionality
- [x] Login/Signup buttons
- [x] Dropdown menus

## 🔥 Firebase Setup

TripleGain uses **Firebase** for:
- Authentication (Email/Password, Google OAuth, GitHub OAuth)
- Firestore Database (User data, products, orders)
- Cloud Storage (Profile pictures, product images)

### Quick Firebase Setup

1. **Read the detailed guide:** See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

2. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project" → Name it "TripleGain"
   - Register a web app

3. **Copy Firebase Config:**
   ```javascript
   // client/src/firebase.js
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };

   export const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

4. **Enable Services:**
   - ✅ Authentication (Email/Password)
   - ✅ Firestore Database
   - ✅ Cloud Storage
   - ✅ Firestore Security Rules

5. **Install Firebase SDK:**
   ```bash
   npm install firebase
   ```

### Default Firestore Collections

```
firestore/
├── users/{userId}
│   ├── fullName: string
│   ├── email: string
│   ├── role: "farmer" | "buyer"
│   ├── location: string
│   └── avatar: url
│
├── products/{productId}
│   ├── name: string
│   ├── farmerId: string
│   ├── price: number
│   └── image: url
│
└── orders/{orderId}
    ├── buyerId: string
    ├── farmerId: string
    └── status: string
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete setup instructions.

## 🔐 Firebase Integration

To set up Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Copy your credentials
4. Add to `server/.env`:
   ```
   FIREBASE_API_KEY=your_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_bucket
   ```

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimized
- ✅ Desktop enhanced
- ✅ Touch-friendly components

## 🎭 Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Lucide React Icons
- Firebase

**Backend:**
- Node.js
- Express.js
- Firebase Admin SDK
- Cors
- Dotenv

## 📦 Dependencies

### Client
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^latest",
  "firebase": "^10.x.x"
}
```

### Server
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "firebase-admin": "^12.0.0",
  "dotenv": "^16.3.1"
}
```

## ⚡ Quick Start (5 Minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/TripleGain.git
cd TripleGain
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Frontend runs at http://localhost:3000 or http://localhost:5173
```

### 3. Backend Setup
```bash
cd ../server
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
# Backend runs at http://localhost:5000
```

### 4. Firebase Setup
Follow the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide to:
- ✅ Create a Firebase project
- ✅ Get your credentials
- ✅ Enable Authentication & Firestore
- ✅ Add credentials to `client/src/firebase.js`

### 5. Test the Application
- 🔗 Homepage: http://localhost:3000
- 🔑 Sign up: http://localhost:3000/signup
- 🔐 Login: http://localhost:3000/login
- 👤 Profile: http://localhost:3000/profile
- 🤖 Chatbot: Bottom-right corner (always available)

## 📖 Step-by-Step Pages Guide

### Login Page (`/login`)
```javascript
import Login from './pages/Login';

// Features:
// ✅ Email/Password authentication
// ✅ Remember me checkbox
// ✅ Social login (Google/GitHub)
// ✅ Link to signup
// ✅ All Firebase auth errors handled
```

### Signup Page (`/signup`)
```javascript
import Signup from './pages/Signup';

// Features:
// ✅ Full form with validation
// ✅ Role selection (Farmer/Buyer)
// ✅ Location and phone input
// ✅ Password confirmation
// ✅ Auto-saves to Firestore
```

### Profile Page (`/profile`)
```javascript
import Profile from './pages/Profile';

// Features:
// ✅ View/Edit user information
// ✅ Statistics dashboard
// ✅ Avatar display
// ✅ Quick action buttons
// ✅ Logout functionality
```

### AI Chatbot (`/components/ai/AIChatbot.jsx`)
```javascript
import AIChatbot from './components/ai/AIChatbot';

// Features:
// ✅ Floating chat widget
// ✅ Context-aware responses
// ✅ Quick action buttons
// ✅ Beautiful glassmorphism design
// ✅ Auto-scroll to latest messages
```

## 🆘 Troubleshooting

### Authentication Issues

**Problem:** "Auth/invalid-credential" error
```
Solution:
1. Check Firebase Email/Password is enabled
2. Verify user exists in Firebase Console
3. Check network connectivity
```

**Problem:** "User not found in Firestore"
```
Solution:
1. Ensure Firestore is initialized
2. Check Security Rules allow writes to /users/{uid}
3. Verify user collection exists
```

### Firebase Connection Issues

**Problem:** "Firebase is not defined"
```bash
# Fix: Install Firebase
npm install firebase

# Update client/src/firebase.js with correct config
```

**Problem:** Firestore queries returning empty
```
Solution:
1. Check Firestore Database has data
2. Verify Security Rules allow reads
3. Check user authentication status
```

### Build Issues

**Problem:** "Module not found"
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

**Problem:** Port already in use
```bash
# Change port in vite.config.js or server config
# Or kill the process using the port
```

## 📚 File Locations

| File | Purpose |
|------|---------|
| `client/src/firebase.js` | Firebase configuration |
| `client/src/pages/Login.jsx` | Login page |
| `client/src/pages/Signup.jsx` | Registration page |
| `client/src/pages/Profile.jsx` | User profile page |
| `client/src/components/ai/AIChatbot.jsx` | Chat widget |
| `client/src/components/layout/Header.jsx` | Navigation header |
| `FIREBASE_SETUP.md` | Firebase setup guide |

## 🔗 Important Links

- 🌍 [Firebase Console](https://console.firebase.google.com)
- 📚 [Firebase Docs](https://firebase.google.com/docs)
- 🎨 [Tailwind CSS](https://tailwindcss.com/docs)
- ⚛️ [React Docs](https://react.dev)
- 🚀 [Vite Docs](https://vitejs.dev)

## 🚀 Deployment

### Deploy Frontend (Vercel)
```bash
npm install -g vercel
cd client
vercel
```

### Deploy Backend (Firebase Cloud Functions)
```bash
firebase deploy --only functions
```

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## 🌟 Key Features to Implement Next

1. ✅ **Authentication** - COMPLETED
   - Firebase Auth setup
   - Login/Signup pages
   - Protected routes

2. ✅ **User Management** - COMPLETED
   - User profiles
   - Firestore integration
   - Profile editing

3. ✅ **AI Assistant** - COMPLETED
   - Chatbot widget
   - Context-aware responses
   - Message history

4. **Disease Detection**
   - Image upload functionality
   - ML model integration
   - Results display

5. **Marketplace**
   - Product listings
   - Real-time pricing
   - Purchase system

6. **Leftover Management**
   - Product categorization
   - Redistribution tracking
   - Impact metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for any purpose!

## 🌍 Vision

Empowering farmers worldwide with AI-driven insights and direct market access, eliminating waste and maximizing prosperity. 🌱

---

**Made with ❤️ for sustainable farming** | Last Updated: March 2026
