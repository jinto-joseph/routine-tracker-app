# ☁️ HabitFlow Cloud Sync Guide

## Overview
HabitFlow now includes **Cloud Sync** functionality that allows you to access your habits and progress from any device!

## How It Works

### First-Time Setup (Device 1)
1. Open HabitFlow on your first device
2. Click **"Cloud Sync"** in the sidebar
3. Click **"Register"**
4. Choose a username and password (at least 6 characters)
5. Your data is automatically uploaded to the cloud ✅

### Login on Another Device (Device 2, 3, etc.)
1. Open HabitFlow on your new device
2. Click **"Cloud Sync"** in the sidebar
3. Enter the **same username and password**
4. Click **"Login"**
5. Your data will automatically download! ✅

## Features

### ✨ What Gets Synced?
- ✅ All your routines (daily and weekly)
- ✅ Progress tracking data
- ✅ Reminder settings
- ✅ Pomodoro session history
- ✅ Theme preference (dark/light mode)

### 🔄 Auto-Sync
- Data syncs automatically every **5 minutes**
- Data syncs when you close the app
- Manual sync available anytime via the Cloud Sync menu

### 🔐 Security
- Passwords are hashed using SHA-256
- Each user's data is stored separately
- Login required to access your data

## Usage Tips

### Manual Sync
1. Click **"Cloud Sync"** in sidebar
2. Click **"Upload Data"** to push your latest changes
3. Click **"Download Data"** to pull latest from cloud

### Switching Devices
- Simply login with your credentials on the new device
- Your data will automatically download
- Any changes you make will sync back

### Multiple Users
- Each user has their own separate account
- Usernames must be unique
- Create different accounts for different people

## Current Implementation Notes

### ⚠️ Important - Current Storage
The current implementation uses **localStorage** for simplicity and demonstration. This means:
- ✅ Works immediately without any server setup
- ✅ Perfect for testing and personal use
- ⚠️ Data is stored locally in your browser
- ⚠️ Clearing browser data will delete stored accounts

### 🚀 For Production Use
To enable true cloud sync across devices, you need to:

1. **Set up a backend server** (Firebase, Supabase, or custom API)
2. **Update the API endpoint** in `cloud-sync.js`:
   ```javascript
   this.apiEndpoint = 'https://your-backend.com/api';
   ```

### Recommended Cloud Backends

#### Option 1: Firebase (Easiest)
```bash
# Install Firebase
npm install firebase

# Configure in cloud-sync.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
```

#### Option 2: Supabase (Open Source)
- Create account at supabase.com
- Create a new project
- Use Supabase Auth + Database
- Update endpoints in cloud-sync.js

#### Option 3: Custom Backend
- Create API with Node.js/Express
- Use MongoDB/PostgreSQL for storage
- Deploy to Vercel/Heroku/AWS

## Troubleshooting

### Can't Login on Second Device?
- Make sure you're using the exact same username and password
- Check if you registered successfully on the first device
- Clear browser cache and try again

### Data Not Syncing?
- Click "Upload Data" manually to force sync
- Check browser console (F12) for errors
- Ensure you're logged in (check sidebar shows "Synced")

### Lost Password?
- Current version: No password recovery (demo version)
- For production: Implement password reset via email

## Future Enhancements

Planned features:
- [ ] Email-based password recovery
- [ ] Real-time sync across devices
- [ ] Offline mode with sync queue
- [ ] Share routines with friends
- [ ] Team/family sharing
- [ ] Data encryption at rest
- [ ] Two-factor authentication

## Support

For issues or questions:
1. Check browser console for error messages
2. Try manual sync via Cloud Sync menu
3. Re-login if sync stops working
4. Export data as backup before troubleshooting

---

**Note**: This is a demo implementation. For production use with real cloud storage, deploy a backend server and update the API endpoint.
