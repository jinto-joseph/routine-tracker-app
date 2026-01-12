// Wellness Tracker - Water Reminders and Sleep Tracking
// Water intake: Recommended 8 glasses per day, one every 2 hours during waking hours (8 AM - 10 PM = 14 hours = 7 reminders)

class WellnessTracker {
  constructor() {
    this.waterInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    this.waterReminderTimer = null;
    this.init();
  }

  init() {
    this.loadTodayData();
    this.startWaterReminders();
    this.setupEventListeners();
  }

  loadTodayData() {
    const dateKey = this.getDateKey(new Date());
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    
    if (!wellnessData[dateKey]) {
      wellnessData[dateKey] = {
        waterIntake: 0,
        bedtime: null,
        wakeTime: null,
        sleepHours: 0
      };
      localStorage.setItem('wellnessData', JSON.stringify(wellnessData));
    }
    
    return wellnessData[dateKey];
  }

  getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  startWaterReminders() {
    // Check if we're in waking hours (8 AM - 10 PM)
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 8 && hour < 22) {
      // Show first reminder after page load
      setTimeout(() => this.showWaterReminder(), 5000); // 5 seconds after load
      
      // Then show every 2 hours
      this.waterReminderTimer = setInterval(() => {
        const currentHour = new Date().getHours();
        if (currentHour >= 8 && currentHour < 22) {
          this.showWaterReminder();
        }
      }, this.waterInterval);
    } else {
      // Schedule first reminder for 8 AM tomorrow
      const tomorrow8AM = new Date();
      tomorrow8AM.setHours(8, 0, 0, 0);
      if (hour >= 22) {
        tomorrow8AM.setDate(tomorrow8AM.getDate() + 1);
      }
      
      const timeUntil8AM = tomorrow8AM - now;
      setTimeout(() => this.startWaterReminders(), timeUntil8AM);
    }
  }

  showWaterReminder() {
    // Get current water count before showing modal
    const todayData = this.loadTodayData();
    const currentWaterCount = todayData.waterIntake;
    
    // Create modal for water reminder
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'waterReminderModal';
    modal.setAttribute('data-bs-backdrop', 'static');
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-droplet-fill"></i> Water Reminder
            </h5>
          </div>
          <div class="modal-body text-center py-4">
            <div class="mb-3">
              <i class="bi bi-droplet-fill text-primary" style="font-size: 4rem;"></i>
            </div>
            <h4>Time to hydrate! 💧</h4>
            <p class="text-muted mb-4">Did you drink a glass of water?</p>
            <div class="d-flex justify-content-center gap-3">
              <button class="btn btn-success btn-lg" onclick="wellnessTracker.recordWater(true)">
                <i class="bi bi-check-circle"></i> Yes
              </button>
              <button class="btn btn-danger btn-lg" onclick="wellnessTracker.recordWater(false)">
                <i class="bi bi-x-circle"></i> Skip
              </button>
            </div>
            <div class="mt-3">
              <small class="text-muted">Today's water intake: <span id="waterCount">${currentWaterCount}</span>/8 glasses</small>
              <div class="mt-2">
                <small class="text-info d-block">💧 Reminder every 2 hours (8 AM - 10 PM)</small>
                <small class="text-info">✅ Click "Yes" only if you just drank water</small>
                <small class="text-info d-block">❌ Click "Skip" if you didn't drink</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Play notification sound
    this.playNotificationSound();
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('💧 Water Reminder', {
        body: 'Time to hydrate! Drink a glass of water.',
        icon: '../icon-192.png'
      });
    }
  }

  recordWater(drank) {
    const dateKey = this.getDateKey(new Date());
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    
    if (!wellnessData[dateKey]) {
      wellnessData[dateKey] = {
        waterIntake: 0,
        bedtime: null,
        wakeTime: null,
        sleepHours: 0
      };
    }
    
    if (drank) {
      wellnessData[dateKey].waterIntake++;
    }
    
    localStorage.setItem('wellnessData', JSON.stringify(wellnessData));
    
    // Close modal
    const modal = document.getElementById('waterReminderModal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();
      modal.remove();
    }
    
    // Update analytics if on analytics page
    if (typeof updateWellnessChart === 'function') {
      updateWellnessChart();
    }
  }

  recordBedtime() {
    const now = new Date();
    
    // If it's past midnight (12 AM - 4 AM), it's actually bedtime for the PREVIOUS day
    // Example: Jan 13 at 12:30 AM is bedtime for Jan 12 night
    let bedtimeDate;
    if (now.getHours() >= 0 && now.getHours() < 4) {
      // It's early morning (12 AM - 4 AM), so this is bedtime for yesterday
      bedtimeDate = new Date(now);
      bedtimeDate.setDate(bedtimeDate.getDate() - 1);
    } else {
      // It's regular daytime, use today's date
      bedtimeDate = now;
    }
    
    const dateKey = this.getDateKey(bedtimeDate);
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    
    if (!wellnessData[dateKey]) {
      wellnessData[dateKey] = {
        waterIntake: 0,
        bedtime: null,
        wakeTime: null,
        sleepHours: 0
      };
    }
    
    wellnessData[dateKey].bedtime = now.toISOString();
    localStorage.setItem('wellnessData', JSON.stringify(wellnessData));
    
    const displayDate = bedtimeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    alert(`✅ Bedtime recorded for ${displayDate}! Good night! 😴`);
  }

  recordWakeTime() {
    const now = new Date();
    const dateKey = this.getDateKey(now);
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    
    if (!wellnessData[dateKey]) {
      wellnessData[dateKey] = {
        waterIntake: 0,
        bedtime: null,
        wakeTime: null,
        sleepHours: 0
      };
    }
    
    wellnessData[dateKey].wakeTime = now.toISOString();
    
    // Calculate sleep hours from today's bedtime to today's wake time
    // (bedtime was recorded when you went to sleep last night, which is stored under today's date)
    if (wellnessData[dateKey] && wellnessData[dateKey].bedtime) {
      const bedtime = new Date(wellnessData[dateKey].bedtime);
      const wakeTime = new Date(wellnessData[dateKey].wakeTime);
      const sleepHours = (wakeTime - bedtime) / (1000 * 60 * 60); // Convert to hours
      
      wellnessData[dateKey].sleepHours = Math.round(sleepHours * 10) / 10; // Round to 1 decimal
      
      alert(`✅ Wake time recorded! You slept ${wellnessData[dateKey].sleepHours} hours. 😊`);
    } else {
      alert('✅ Wake time recorded! (Bedtime not found - mark Sleep routine tonight at 12 AM)');
    }
    
    localStorage.setItem('wellnessData', JSON.stringify(wellnessData));
    
    // Update analytics if on analytics page
    if (typeof updateWellnessChart === 'function') {
      updateWellnessChart();
    }
  }

  playNotificationSound() {
    try {
      const audio = new Audio('../water.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Audio creation failed:', err);
    }
  }

  setupEventListeners() {
    // Request notification permission on first interaction
    document.addEventListener('click', () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }, { once: true });
  }

  getTodayWaterIntake() {
    const dateKey = this.getDateKey(new Date());
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    return wellnessData[dateKey]?.waterIntake || 0;
  }

  getTodaySleepHours() {
    const dateKey = this.getDateKey(new Date());
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{}');
    return wellnessData[dateKey]?.sleepHours || 0;
  }
}

// Initialize wellness tracker
let wellnessTracker;
document.addEventListener('DOMContentLoaded', () => {
  wellnessTracker = new WellnessTracker();
});
