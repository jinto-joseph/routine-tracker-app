# 🎯 Habit Tracker & Productivity Suite

A comprehensive web-based habit tracking and productivity management application with Pomodoro timer, analytics, and calendar integration. Built as a Progressive Web App (PWA) for seamless offline use and mobile installation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-purple.svg)

## ✨ Features

### 📅 Routine Tracking
- **Daily & Weekly Routines**: Organize tasks by day with customizable schedules
- **SAVERS Integration**: Morning routine tracking (Silence, Affirmation, Visualization, Exercise, Reading, Scribbing)
- **Time Goals**: Set and track time-based goals for each routine
- **Status Tracking**: Mark routines as completed, missed, or in-progress
- **Categories**: Organize routines by Morning, Study, Work, Spiritual, Personal, etc.

### ⏱️ Pomodoro Timer
- **Auto-Cycling**: Automatically transitions between work sessions and breaks
- **Smart Break System**: 
  - 5-minute short breaks after each pomodoro
  - 15-minute long break after 4 pomodoros
- **Category Tracking**: Tag sessions by category (Career, Improvement, Personal, Study, Health)
- **Session History**: View and manage today's completed sessions
- **Customizable Timers**: Set custom work and break durations
- **Audio Notifications**: Custom tone2pi.mp3 sound alerts

### 📊 Analytics Dashboard
- **Progress Tracking**: Daily, weekly, and monthly progress visualization
- **Multiple Chart Types**:
  - Daily Progress Trend (Line Chart)
  - Weekly Comparison (Bar Chart)
  - Task Completion Rate (Pie Chart)
  - Pomodoro Time Utilization by Category (Doughnut Chart)
  - Weekly Progress Score (Line Chart)
  - Wellness Metrics (Radar Chart)
  - Improvement Trend (Moving Average)
  - Monthly Overview (Bar Chart)
- **Wellness Tracking**: Automatic tracking of Exercise, Sleep, Meditation, and Hydration
- **Smart Calculations**: Sleep hours calculated from wake-up time, SAVERS completion tracking

### 🗓️ Calendar & Events
- **Mini Calendar**: Month view with event indicators
- **Event Management**: Create, view, and manage date-specific events
- **Event Notifications**: Browser notifications at scheduled event times
- **Event Details**: Title, time, and description support

### 🎨 User Interface
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Auto-Hide Sidebar**: Hover-activated navigation sidebar
- **Beautiful Animations**: Smooth transitions and visual feedback
- **Blue/Black Color Scheme**: Modern, professional aesthetic

### 🔔 Notifications & Reminders
- **Routine Alarms**: Set time-based reminders for specific routines
- **Browser Notifications**: Desktop notifications with permission system
- **Event Reminders**: Automatic notifications for scheduled events
- **Custom Sounds**: tone2pi.mp3 audio for all notifications

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Full functionality without internet connection
- **Service Worker**: Caching for instant loading
- **App Icons**: Custom 192x192 and 512x512 PNG icons
- **Manifest**: Complete PWA configuration

### 💾 Data Management
- **Local Storage**: All data stored locally in browser
- **Export/Import**: Export data as JSON for backup
- **Auto-Save**: Automatic saving of all changes
- **Data Persistence**: Routines and progress persist across sessions

## 🚀 Installation

### Option 1: Direct Use (No Installation Required)
1. Clone the repository:
```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

2. Open `routine-tracker/index.html` in your web browser

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000/routine-tracker/`

### Option 3: Install as PWA
1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Look for the "Install" button in the address bar or app menu
3. Click to install the app on your device
4. Access from your home screen or app drawer

## 📖 Usage
3. **No server required** - works directly from file system or local server

### Using a Local Server (Recommended)

For best experience, use a local server:

#### Python
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000/routine-tracker/
```


### Setting Up Routines
1. Click **"Edit Routines"** or **"Add Routines"** in the sidebar
2. Configure routine details:
   - Name
   - Time goal (in minutes)
   - Default time
   - Days of the week
   - Category
3. Save changes

### Tracking Daily Progress
1. View today's routines on the home page
2. Click the ✓ button to mark as completed
3. Click the ✗ button to mark as missed
4. Click the ○ button to reset status
5. Track time spent using the built-in timer

### Using the Pomodoro Timer
1. Navigate to the Pomodoro page via sidebar
2. Select a category for your session
3. Choose session type (Pomodoro/Short Break/Long Break)
4. Click **Start** to begin
5. Timer auto-cycles through work and break sessions
6. View session history at the bottom

### Viewing Analytics
1. Navigate to the Analytics page
2. Select date range if desired
3. View charts showing:
   - Your progress trends
   - Task completion rates
   - Pomodoro time utilization
   - Wellness metrics
4. Track improvement over time

### Managing Events
1. Open the sidebar calendar
2. Click on any date
3. Add event title, time, and description
4. Save to create event
5. Dates with events show indicators
6. Receive notifications at event time

### Customizing Theme
- Click the 🌙/☀️ button in the navbar to toggle theme
- Preference is saved and synced across pages

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables
- **JavaScript (ES6+)**: Modern vanilla JavaScript
- **Bootstrap 5.3.2**: UI framework
- **Bootstrap Icons**: Icon library
- **Chart.js 4.4.0**: Data visualization

### PWA Technologies
- **Service Worker**: Offline caching and background sync
- **Web App Manifest**: PWA configuration
- **Cache API**: Asset caching
- **Notifications API**: Desktop notifications
- **LocalStorage API**: Data persistence

### Audio
- **Web Audio API**: Fallback for notifications
- **HTML5 Audio**: Custom notification sounds

## 📁 Project Structure

```
habit-tracker/
├── routine-tracker/
│   ├── index.html              # Main tracker page
│   ├── pomodoro.html           # Pomodoro timer page
│   ├── analytics.html          # Analytics dashboard
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── icon-192.png            # App icon (192x192)
│   └── icon-512.png            # App icon (512x512)
├── css/
│   └── style.css               # Main stylesheet
├── js/
│   ├── app.js                  # Core application logic
│   ├── pomodoro.js             # Pomodoro timer logic
│   ├── analytics.js            # Analytics and charts
│   └── routines-data.js        # Default routines data
├── data/
│   └── routines.json           # Routines configuration
├── tone2pi.mp3                 # Notification sound
├── test-buttons.html           # UI testing page
├── README.md                   # Documentation
├── LICENSE                     # MIT License
├── CONTRIBUTING.md             # Contribution guidelines
└── .gitignore                  # Git ignore rules
```

## 🎨 Color Scheme

### Light Theme
- Primary: `#2196f3` (Blue)
- Background: `#e3f2fd` → `#bbdefb` (Light Blue Gradient)
- Card: `#ffffff` (White)
- Text: `#212529` (Dark Gray)

### Dark Theme
- Primary: `#2196f3` (Blue)
- Background: `#000000` → `#1a1a1a` (Black Gradient)
- Card: `#1e1e1e` (Dark Gray)
- Text: `#f8f9fa` (Light Gray)

## 📊 Data Storage

All data is stored locally using browser LocalStorage:

- **routinesData**: Routine configurations
- **routineTracker**: Daily progress tracking
- **pomodoroHistory**: Pomodoro session records
- **calendarEvents**: Scheduled events
- **theme**: User theme preference

## 🔧 Configuration

### Adding Custom Routines
Edit `data/routines.json` or use the in-app editor:

```json
{
  "name": "Morning Exercise",
  "goal": 30,
  "defaultTime": "06:00",
  "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "category": "Health"
}
```

### Customizing Notification Sound
Replace `tone2pi.mp3` with your preferred sound file (keep the same filename)

## 🌐 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

PWA installation requires:
- Chrome/Edge 90+ (Desktop & Mobile)
- Safari 14+ (iOS/iPadOS)

## 📱 Mobile Support

Fully responsive design optimized for:
- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1440px+)

## 🔒 Privacy

- **100% Local**: All data stored in browser
- **No Server**: No data sent to external servers
- **No Tracking**: No analytics or tracking scripts
- **Offline First**: Works completely offline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🐛 Known Issues

- Service worker may need manual refresh on first install
- iOS Safari requires user gesture for notifications

## 🗺️ Roadmap

- [ ] Cloud sync support
- [ ] Habit streaks and achievements
- [ ] Data import from CSV
- [ ] Custom chart configurations
- [ ] Team/shared routines
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Bootstrap team for the excellent UI framework
- Chart.js for powerful data visualization
- Bootstrap Icons for comprehensive icon set
- The open-source community

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Email: your.email@example.com

---

**Made with ❤️ for productivity enthusiasts**

⭐ Star this repo if you find it helpful!

## Customization

### Adding/Editing Routines

Edit `data/routines.json`:

```json
{
  "daily": [
    "Wake up early",
    "Exercise",
    "Your custom task here"
  ],
  "weekly": [
    "Weekly planning session",
    "Your weekly task here"
  ]
}
```

### Styling

Edit `css/style.css` to customize colors, fonts, and layout. The theme system uses CSS variables:

```css
:root {
  --bg: #ffffff;
  --text: #212529;
  --card: #f8f9fa;
  /* ... */
}
```

## Converting to a Mobile App

### Option 1: Progressive Web App (PWA) - Recommended

Convert to PWA for installable app experience:

1. **Create `manifest.json`** in `routine-tracker/`:
```json
{
  "name": "Routine Tracker",
  "short_name": "Routine",
  "description": "Daily and weekly habit tracker",
  "start_url": "/routine-tracker/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d6efd",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Add to `index.html`** `<head>`:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#0d6efd">
```

3. **Create Service Worker** (`sw.js`) for offline support
4. **Generate app icons** (192x192 and 512x512 PNG)

### Option 2: Cordova/PhoneGap

1. **Install Cordova CLI**:
```bash
npm install -g cordova
```

2. **Create Cordova project**:
```bash
cordova create routine-tracker-app com.yourname.routinetracker "Routine Tracker"
cd routine-tracker-app
```

3. **Copy files**:
```bash
# Copy your HTML, CSS, JS files to www/ directory
cp -r ../routine-tracker/* www/
cp -r ../css www/
cp -r ../js www/
cp -r ../data www/
```

4. **Add platforms**:
```bash
cordova platform add android
cordova platform add ios  # macOS only
```

5. **Build**:
```bash
cordova build android
cordova build ios
```

6. **Test**:
```bash
cordova run android
```

### Option 3: Capacitor (Modern Alternative)

1. **Install Capacitor**:
```bash
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar
```

2. **Initialize**:
```bash
npx cap init "Routine Tracker" "com.yourname.routinetracker"
```

3. **Add platforms**:
```bash
npx cap add android
npx cap add ios
```

4. **Copy web assets**:
```bash
npx cap copy
```

5. **Open in IDE**:
```bash
npx cap open android  # Opens Android Studio
npx cap open ios      # Opens Xcode
```

### Option 4: Electron (Desktop App)

1. **Install Electron**:
```bash
npm init -y
npm install electron --save-dev
```

2. **Create `main.js`**:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('routine-tracker/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

3. **Update `package.json`**:
```json
{
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  }
}
```

4. **Run**:
```bash
npm start
```

### Option 5: React Native / Flutter

For native mobile apps, you'll need to:
1. Rewrite the UI using React Native or Flutter components
2. Use AsyncStorage (React Native) or SharedPreferences (Flutter) for data persistence
3. Use native chart libraries
4. Implement push notifications using native APIs

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Opera: Full support

## Data Storage

All data is stored in browser's `localStorage`:
- **Key**: `routineTracker` - Contains all routine completion data
- **Key**: `reminderSettings` - Reminder preferences
- **Key**: `pomodoroSessions` - Pomodoro session counts
- **Key**: `pomodoroHistory` - Pomodoro session history
- **Key**: `theme` - Theme preference

## Privacy

- **100% Local**: All data stays on your device
- **No Server**: No data sent to external servers
- **No Tracking**: No analytics or tracking scripts
- **Exportable**: You can export all your data anytime

## Troubleshooting

### Charts not showing
- Ensure Chart.js is loaded (check browser console)
- Verify date range has data

### Reminders not working
- Check browser notification permissions
- Ensure browser allows notifications

### Data not persisting
- Check browser localStorage is enabled
- Try clearing cache and reloading

### Theme not saving
- Check localStorage is enabled
- Clear browser cache if issues persist

## Future Enhancements

Potential features to add:
- Cloud sync (optional)
- Multiple routine sets
- Habit templates
- Social sharing
- Achievement badges
- Custom routine categories
- Recurring reminders per task

## License

Free to use and modify for personal use.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are in correct locations
3. Ensure using a local server (not just file://)

---

**Enjoy tracking your routines and building better habits!** 🎯
