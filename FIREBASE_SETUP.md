# Firebase Setup Guide for TripleGain 🔥

This guide will help you set up Firebase for the TripleGain application.

## 📋 Prerequisites

- Google Cloud Account
- Node.js installed
- A TripleGain project cloned locally

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `TripleGain` (or your preferred name)
4. Accept the terms and click **"Create project"**
5. Wait for the project to be created, then click **"Continue"**

## Step 2: Register Your App

1. In the Firebase Console, click the **Web icon** (`</>`) to register a web app
2. Enter app name: `TripleGain Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**
5. Firebase will provide your config - **COPY THIS** (you'll need it next)

Example config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Step 3: Enable Firebase Services

### Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Find **"Email/Password"** and click it
4. Toggle **"Enable"** and click **"Save"**
5. Optionally enable Google and GitHub OAuth:
   - Click **"Google"** → Toggle enable
   - Click **"GitHub"** → Toggle enable and enter credentials

### Enable Firestore Database

1. Go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose location (closest to your users)
4. Start in **"Production mode"** (we'll configure security rules next)
5. Click **"Create"**

### Configure Firestore Security Rules

Replace the default rules with these:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Products collection (public read)
    match /products/{productId} {
      allow read: if true;
      allow write, delete: if request.auth.uid == resource.data.farmerId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.buyerId || request.auth.uid == resource.data.farmerId;
    }
  }
}
```

Click **"Publish"** to apply the rules.

## Step 4: Create Firebase Config File

1. In your project directory, create `client/src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

2. Replace with your actual Firebase config values

## Step 5: Install Firebase Dependencies

```bash
cd client
npm install firebase
```

## Step 6: Update Environment Variables (Optional)

Create `.env.local` in the client directory:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

Then update `firebase.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Step 7: Test Authentication

1. Run the development server:
```bash
npm run dev
```

2. Go to http://localhost:3000/signup
3. Create a test account
4. Firebase Console → Authentication → Users should show your new user ✅

## Step 8: Firebase Hosting (Optional)

To deploy your app to Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
npm run build
firebase deploy
```

## 📚 Firestore Database Structure

Your Firestore will automatically organize like this:

```
Firestore/
├── users/
│   ├── {userId}/
│   │   ├── fullName: "John Doe"
│   │   ├── email: "john@example.com"
│   │   ├── phone: "+60123456789"
│   │   ├── location: "Kuala Lumpur"
│   │   ├── role: "farmer"
│   │   ├── avatar: "https://..."
│   │   └── createdAt: timestamp
│
├── products/
│   ├── {productId}/
│   │   ├── name: "Fresh Tomatoes"
│   │   ├── farmerId: "userId"
│   │   ├── price: 45
│   │   ├── quantity: 500
│   │   ├── image: "https://..."
│   │   └── createdAt: timestamp
│
└── orders/
    ├── {orderId}/
    │   ├── buyerId: "userId"
    │   ├── farmerId: "userId"
    │   ├── productId: "productId"
    │   ├── status: "completed"
    │   └── timestamp: timestamp
```

## 🔐 Security Best Practices

✅ **Do:**
- Keep Firebase credentials in environment variables
- Use Firestore security rules
- Enable authentication
- Set up proper database indexes
- Review user permissions regularly

❌ **Don't:**
- Commit `firebase.js` with real credentials to git
- Allow public write access to all collections
- Expose API keys in client-side code (use environment variables)
- Skip security rules configuration

## 🆘 Troubleshooting

### "Firebase is not defined"
Install Firebase: `npm install firebase`

### "Permission denied" error
Check Firestore security rules are properly configured

### Authentication not working
Ensure Email/Password is enabled in Firebase Authentication

### Images not uploading
Check that Firebase Storage is initialized and rules allow uploads

## 📖 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Database](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)

---

For issues or questions, check the [Firebase Support](https://firebase.google.com/support) page.
