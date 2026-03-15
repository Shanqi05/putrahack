# 👥 Setup Guide for Teammates

**Welcome to TripleGain!** 🌱

This guide will help you get the project running in **less than 10 minutes**.

---

## ⚡ TLDR (Super Quick)

```bash
# Terminal 1 - Backend
cd server && npm install && npm start

# Terminal 2 - Frontend  
cd client && npm install && npm run dev
```

**Then:**
1. Create `server/.env` with your Google AI key
2. Open http://localhost:3001
3. Done! 🎉

---

## 📋 Prerequisites

Before starting, install:

1. **Node.js** (v16+)
   - Download: https://nodejs.org/
   - Verify: `node --version` (should be v16+)

2. **npm** (usually comes with Node.js)
   - Verify: `npm --version` (should be v10+)
   - If old: `npm install -g npm@latest`

3. **Git** (for cloning repository)
   - Download: https://git-scm.com/

4. **Code Editor** (optional but recommended)
   - VS Code: https://code.visualstudio.com/
   - Cursor: https://cursor.sh/

---

## 🚀 Step-by-Step Setup

### Step 1️⃣: Clone & Navigate

```bash
# Clone the repository (ask team lead for URL)
git clone <repository-url>

# Navigate to project
cd putrahack

# Check you're in right place
ls -la  # Mac/Linux
dir     # Windows
# Should see: client/, server/, README.md, etc.
```

### Step 2️⃣: Get Google AI API Key (5 minutes)

**This is REQUIRED for the chatbot to work!**

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with any Google account
3. Click **"Create API Key"**
4. Copy the generated key
5. **Save it somewhere safe** - you'll need it next

### Step 3️⃣: Backend Setup

```bash
# Go to server folder
cd server

# Install all dependencies
npm install
# This downloads ~200MB of packages (takes 1-2 min)

# Verify installation
npm list
# Should show all packages without "missing" errors
```

**Create `.env` file:**

```bash
# In server/ folder, create a file named: .env

# The file should contain:
PORT=5000
NODE_ENV=development
JWT_SECRET=triplegain-secret-key-change-in-production-2024
GOOGLE_AI_API_KEY=PASTE_YOUR_KEY_HERE
```

**Quick Windows users:**
```powershell
# PowerShell command to create empty .env
"" | Out-File -FilePath .env -Encoding UTF8

# Then edit with Notepad or VS Code and paste content above
```

**Start Backend:**
```bash
npm start
# Should show:
# ╔═══════════════════════════════════╗
# ║   TripleGain API Server Running    ║
# ║   🌱 Protecting Crops, Growing    ║
# ║   Port: 5000                       ║
# ╚═══════════════════════════════════╝
```

**Keep this terminal open!** ✅

### Step 4️⃣: Frontend Setup (New Terminal)

```bash
# Open NEW terminal/PowerShell window

# Go to client folder
cd client

# Install dependencies
npm install
# This takes 1-2 minutes

# Verify installation
npm list
# Should show all packages without errors
```

**Start Frontend:**
```bash
npm run dev

# Should show something like:
# ➜  Local:   http://localhost:3001
# ➜  Network: use --host to expose
```

**Browser opens automatically!** 🎉

---

## ✅ Verify Everything Works

### Check 1: Backend Health
```bash
# In a 3rd terminal, run:
curl http://localhost:5000/api/health

# Should return (Windows - use browser):
# {"status": "Server is running", ...}
```

### Check 2: Frontend Loads
- Open: http://localhost:3001
- Should see TripleGain homepage with logo

### Check 3: Signup Works
1. Click "Sign Up" button (top right)
2. Fill form:
   - Name: Test Farmer
   - Type: Farmer
   - Email: test@example.com
   - Region: Selangor
   - Password: test123456
3. Click "Create Account"
4. ✅ Should see navigation links appear

### Check 4: Chatbot Works
1. Click chat bubble (bottom right) 💬
2. Type: "What are common crop diseases?"
3. ✅ AI should respond within 5 seconds

---

## 📁 Project Structure

```
putrahack/
├── client/                    ← React Frontend
│   ├── node_modules/         (created after npm install)
│   ├── src/
│   │   ├── pages/            (Homepage, Login, etc)
│   │   ├── components/       (Reusable UI components)
│   │   ├── services/         (API calls, Firebase)
│   │   ├── context/          (Auth state management)
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                    ← Express API
│   ├── node_modules/         (created after npm install)
│   ├── index.js              (Main API file)
│   ├── .env                  (CREATE THIS!)
│   ├── .env.example          (Template - see this first)
│   └── package.json
│
├── README.md                 ← Main documentation
├── CHATBOT_SETUP.md          ← AI chatbot guide
└── IMPLEMENTATION_COMPLETE.md ← Auth system docs
```

---

## 🔧 Common Tasks

### Want to work on something?

```bash
# 1. Check status
git status

# 2. Create a new branch
git checkout -b feature/your-feature-name

# 3. Make changes

# 4. Stage changes
git add .

# 5. Commit
git commit -m "Description of what you changed"

# 6. Push
git push origin feature/your-feature-name

# 7. Create Pull Request on GitHub
```

### Made a mistake? Reset everything

```bash
# Frontend
cd client
rm -rf node_modules package-lock.json
npm install

# Backend
cd server
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **npm install very slow** | Use `npm cache clean --force` then retry |
| **Port 5000 in use** | Change PORT in server/.env to 5001 |
| **Port 3001 in use** | Vite automatically tries 3002, 3003, etc |
| **"Cannot find module"** | Delete node_modules, run `npm install` again |
| **Chatbot not responding** | Check server/.env has GOOGLE_AI_API_KEY |
| **Login/Signup sends error** | Backend must be running on port 5000 |
| **"node: command not found"** | Node.js not installed, see Prerequisites |
| **Stuck on loading** | Check browser console: F12 → Console tab |

### Debug Mode (See what errors are happening)

```bash
# Open browser Developer Tools
F12  # or Ctrl+Shift+I

# Look in Console tab for red error messages
# Common errors:
# - NetworkError: Backend not running
# - Invalid token: GOOGLE_AI_API_KEY missing
# - CORS error: Backend PORT wrong
```

---

## 📞 Need Help?

1. **Check README.md** - Main documentation
2. **Check IMPLEMENTATION_COMPLETE.md** - Auth system
3. **Check CHATBOT_SETUP.md** - AI chatbot setup
4. **Ask team lead** - If stuck, reach out!

---

## 🎯 Your First Tasks

As a new team member, try these:

1. ✅ Get everything running
2. ✅ Create an account and login
3. ✅ Ask the chatbot a question
4. ✅ Check if Disease Detection page loads
5. ✅ Look at **one** file and understand it
6. ✅ Ask team for a real task!

---

## 🚀 Next Steps (When ready to code)

- **Frontend Changes?** Edit files in `client/src/`
- **Backend Changes?** Edit files in `server/`
- **Tests don't work?** Check `npm test` (if exists)
- **Deploy?** Ask team lead about deployment process

---

## 💡 Pro Tips

✨ **VS Code Extensions (Recommended):**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

✨ **Keyboard Shortcuts:**
- `Ctrl+K Ctrl+O` - Open folder
- `Ctrl+~` - Open terminal
- `Ctrl+Shift+F` - Find in files
- `F5` - Refresh browser

✨ **Browser DevTools:**
- `F12` - Open DevTools
- `Ctrl+Shift+I` - Alternative
- `Console` tab - See errors
- `Network` tab - See API calls
- `Application` tab - See localStorage

---

## ✨ Welcome to the Team! 

You're all set! Start with the main README.md and ask questions anytime. 

**Happy coding! 🌱**

---

*Updated: March 2026*
*For latest updates, check: README.md*
