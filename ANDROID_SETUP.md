# 📱 Converting to Android App

This guide shows you multiple ways to use the Habit Tracker on Android devices.

## Option 1: Install as PWA (Easiest - Already Works!)

Your app is already a Progressive Web App and can be installed directly from the browser.

### Steps:
1. Open the app in **Chrome** or **Edge** on your Android phone
2. Navigate to your hosted URL (e.g., `https://yourusername.github.io/habit-tracker/routine-tracker/`)
3. Tap the **three-dot menu** (⋮) in the browser
4. Select **"Add to Home Screen"** or **"Install App"**
5. Confirm and the app will be added to your home screen
6. Launch it like any other app!

### Advantages:
- ✅ No coding required
- ✅ Works offline
- ✅ Automatic updates when you update the web version
- ✅ Full-screen experience
- ✅ Access to notifications

### Note:
You need to host the app online first. Options:
- **GitHub Pages** (Free)
- **Netlify** (Free)
- **Vercel** (Free)

---

## Option 2: Create Native Android App with Capacitor (Recommended)

Convert your PWA into a native Android app that can be published to Google Play Store.

### Prerequisites:
- Node.js installed
- Android Studio installed
- Basic command line knowledge

### Step 1: Install Capacitor

```bash
# Navigate to your project
cd "c:\Users\Lenovo\Desktop\Habit tracker"

# Initialize npm project
npm init -y

# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize Capacitor
npx cap init "Habit Tracker" "com.yourname.habittracker" --web-dir="."
```

### Step 2: Configure capacitor.config.json

Create `capacitor.config.json` in your project root:

```json
{
  "appId": "com.yourname.habittracker",
  "appName": "Habit Tracker",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "url": "http://localhost:8080",
    "cleartext": true
  }
}
```

### Step 3: Add Android Platform

```bash
# Add Android platform
npx cap add android

# Sync files
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 4: Configure Android Permissions

Edit `android/app/src/main/AndroidManifest.xml` to add permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### Step 5: Build and Run

In Android Studio:
1. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Once built, install on your device or emulator
3. Or click the **Run** button to test on a connected device

### Step 6: Generate Signed APK for Distribution

1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Select **APK** → **Next**
3. Create a new keystore or use existing
4. Fill in keystore details
5. Choose **release** build variant
6. Click **Finish**

The APK will be in `android/app/release/app-release.apk`

---

## Option 3: Trusted Web Activity (TWA) for Play Store

Publish your PWA directly to Google Play Store without converting to native.

### Prerequisites:
- Your PWA hosted on HTTPS
- Google Play Developer account ($25 one-time fee)
- Android Studio

### Step 1: Use Bubblewrap

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize TWA
bubblewrap init --manifest https://yourusername.github.io/habit-tracker/routine-tracker/manifest.json

# Build
bubblewrap build

# The APK will be in ./app-release-signed.apk
```

### Step 2: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in app details
4. Upload your signed APK
5. Submit for review

---

## Option 4: Host Online and Use PWA

### GitHub Pages (Free Hosting)

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/habit-tracker.git
git push -u origin main

# Enable GitHub Pages
# Go to Settings → Pages → Select 'main' branch → Save
```

Your app will be available at:
`https://yourusername.github.io/habit-tracker/routine-tracker/`

### Netlify (Free Hosting)

1. Go to [netlify.com](https://netlify.com)
2. Sign up and click **Add new site**
3. Drag and drop your project folder
4. Your app will be live at `yourappname.netlify.app`

---

## Comparison Table

| Method | Difficulty | Play Store | Offline | Native Features | Cost |
|--------|-----------|-----------|---------|----------------|------|
| PWA Install | ⭐ Easy | ❌ No | ✅ Yes | Limited | Free |
| Capacitor | ⭐⭐⭐ Medium | ✅ Yes | ✅ Yes | ✅ Full | Free |
| TWA (Bubblewrap) | ⭐⭐ Easy | ✅ Yes | ✅ Yes | Limited | $25 |
| GitHub Pages + PWA | ⭐ Easy | ❌ No | ✅ Yes | Limited | Free |

---

## Recommended Approach

### For Personal Use:
1. Host on GitHub Pages (free)
2. Install as PWA from browser
3. Use like a native app

### For Distribution:
1. Use **Capacitor** for full native app experience
2. Or use **TWA (Bubblewrap)** for faster deployment
3. Publish to Google Play Store

---

## Additional Configuration for Better Android Experience

### 1. Update manifest.json

Make sure your `routine-tracker/manifest.json` has:

```json
{
  "name": "Habit Tracker",
  "short_name": "Habits",
  "description": "Track your daily habits and productivity",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#2196f3",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 2. Add Splash Screen

Create `android/app/src/main/res/drawable/splash.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/blue"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/ic_launcher"/>
    </item>
</layer-list>
```

### 3. Configure App Name and Icon

Use Android Asset Studio to generate icons:
1. Go to [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
2. Upload your icon-512.png
3. Download and replace in `android/app/src/main/res/`

---

## Testing Your App

### Test on Physical Device:
```bash
# Enable USB debugging on your Android phone
# Connect via USB
# Run:
npx cap run android
```

### Test as PWA:
```bash
# Serve locally
python -m http.server 8080

# Open on phone's browser (same WiFi):
# http://YOUR_PC_IP:8080/routine-tracker/
```

---

## Troubleshooting

### PWA not installing?
- Ensure you're using HTTPS (or localhost)
- Check manifest.json is valid
- Verify service worker is registered
- Check browser console for errors

### Capacitor build fails?
- Update Android Studio to latest version
- Update Gradle in Android Studio
- Run `npx cap sync android`
- Clean and rebuild: `./gradlew clean`

### App permissions not working?
- Check AndroidManifest.xml
- Request runtime permissions for Android 13+
- Test on different Android versions

---

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PWA Builder](https://www.pwabuilder.com/)
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [Android Studio Download](https://developer.android.com/studio)
- [Google Play Console](https://play.google.com/console)

---

## Quick Start Recommendation

**Fastest way to get your app on Android:**

1. **Deploy to GitHub Pages** (5 minutes)
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push
   # Enable GitHub Pages in repository settings
   ```

2. **Install as PWA** (1 minute)
   - Open the GitHub Pages URL on Android
   - Tap "Add to Home Screen"
   - Done! ✅

This gives you a fully functional Android app without any build process!

---

**Need help?** Open an issue on GitHub with the "android" label.
