// Wellness Tracker - Water Reminders and Sleep Tracking
// Water intake: 110ml every hour from 6:45 AM to 11:45 PM (17 hours = 18 reminders)

class WellnessTracker {
  constructor() {
    this.waterInterval = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
    this.waterReminderTimer = null;
    this.startHour = 6; // 6 AM
    this.startMinute = 45; // 45 minutes
    this.endHour = 23; // 11 PM
    this.endMinute = 45; // 45 minutes
    this.waterAmount = 110; // ml
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
        waterSkipped: 0,
        totalReminders: 0,
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
    // Check if we're in reminder hours (6:45 AM - 11:45 PM)
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTimeInMinutes = hour * 60 + minute;
    const startTimeInMinutes = this.startHour * 60 + this.startMinute; // 6:45 AM = 405 min
    const endTimeInMinutes = this.endHour * 60 + this.endMinute; // 11:45 PM = 1425 min
    
    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
      // Calculate next reminder time (next :45 minute mark)
      const minutesUntilNext45 = 45 - minute;
      const nextReminderDelay = minutesUntilNext45 > 0 && minutesUntilNext45 < 45 
        ? minutesUntilNext45 * 60 * 1000 
        : (60 - minute + 45) * 60 * 1000;
      
      // Show first reminder at next :45 mark
      setTimeout(() => {
        this.showWaterReminder();
        
        // Then show every hour at :45
        this.waterReminderTimer = setInterval(() => {
          const current = new Date();
          const currentMin = current.getHours() * 60 + current.getMinutes();
          if (currentMin >= startTimeInMinutes && currentMin <= endTimeInMinutes && current.getMinutes() === 45) {
            this.showWaterReminder();
          }
        }, this.waterInterval);
      }, nextReminderDelay);
    } else {
      // Schedule first reminder for 6:45 AM tomorrow or today
      const nextReminder = new Date();
      nextReminder.setHours(this.startHour, this.startMinute, 0, 0);
      if (currentTimeInMinutes > endTimeInMinutes) {
        nextReminder.setDate(nextReminder.getDate() + 1);
      }
      
      const timeUntilNext = nextReminder - now;
      setTimeout(() => this.startWaterReminders(), timeUntilNext);
    }
  }

  showWaterReminder() {
    // Get current water count before showing modal
    const todayData = this.loadTodayData();
    const currentWaterCount = todayData.waterIntake || 0;
    const skippedCount = todayData.waterSkipped || 0;
    const totalReminders = todayData.totalReminders || 0;
    
    // Calculate how many reminders are left today
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const endTimeInMinutes = this.endHour * 60 + this.endMinute; // 11:45 PM
    const remainingHours = Math.floor((endTimeInMinutes - currentTimeInMinutes) / 60);
    const remainingReminders = Math.max(1, remainingHours + 1); // Including current reminder
    
    // Calculate deficit and recommended amount
    const totalDailyGoal = 18; // 18 reminders per day
    const expectedByNow = totalReminders + 1; // Including this reminder
    const actualIntake = currentWaterCount;
    const deficit = expectedByNow - actualIntake - 1; // How many were skipped
    
    let recommendedAmount = 110; // Default
    let extraMessage = '';
    
    if (deficit > 0 && remainingReminders > 1) {
      // Calculate extra amount to drink per remaining reminder
      const missedWater = deficit * 110;
      const extraPerReminder = Math.ceil(missedWater / remainingReminders);
      recommendedAmount = 110 + extraPerReminder;
      extraMessage = `
        <div class="alert alert-warning mt-3 mb-0">
          <i class="bi bi-exclamation-triangle"></i> 
          <strong>Catch up needed!</strong><br>
          <small>You missed ${deficit} reminder${deficit > 1 ? 's' : ''} (${missedWater}ml). 
          Drink <strong>${recommendedAmount}ml</strong> now to stay on track!</small>
        </div>
      `;
    } else if (deficit > 0 && remainingReminders === 1) {
      // Last reminder of the day
      const missedWater = deficit * 110;
      recommendedAmount = 110 + missedWater;
      extraMessage = `
        <div class="alert alert-danger mt-3 mb-0">
          <i class="bi bi-exclamation-circle"></i> 
          <strong>Last chance!</strong><br>
          <small>This is your last reminder. Drink <strong>${recommendedAmount}ml</strong> to meet today's goal!</small>
        </div>
      `;
    } else if (actualIntake >= totalDailyGoal) {
      extraMessage = `
        <div class="alert alert-success mt-3 mb-0">
          <i class="bi bi-check-circle"></i> 
          <strong>Goal achieved! 🎉</strong><br>
          <small>You've met your daily water goal. Great job!</small>
        </div>
      `;
    }
    
    const totalIntakeML = currentWaterCount * 110;
    const goalML = totalDailyGoal * 110;
    
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
            <p class="text-muted mb-2">Recommended amount: <strong>${recommendedAmount}ml</strong></p>
            <div class="d-flex justify-content-center gap-3">
              <button class="btn btn-success btn-lg" onclick="wellnessTracker.recordWater(true)">
                <i class="bi bi-check-circle"></i> Yes
              </button>
              <button class="btn btn-danger btn-lg" onclick="wellnessTracker.recordWater(false)">
                <i class="bi bi-x-circle"></i> Skip
              </button>
            </div>
            <div class="mt-3">
              <small class="text-muted d-block">Today's progress: <span id="waterCount">${currentWaterCount}</span>/${totalDailyGoal} times</small>
              <small class="text-muted d-block">${totalIntakeML}ml / ${goalML}ml (${Math.round((totalIntakeML/goalML)*100)}%)</small>
              <small class="text-muted d-block">Remaining reminders: ${remainingReminders}</small>
              <div class="mt-2">
                <small class="text-info d-block">💧 Every hour at :45 (6:45 AM - 11:45 PM)</small>
                <small class="text-info d-block">✅ Standard: 110ml | With catch-up: ${recommendedAmount}ml</small>
              </div>
            </div>
            ${extraMessage}
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
      const notifBody = deficit > 0 
        ? `Catch up needed! Drink ${recommendedAmount}ml of water.`
        : `Time to hydrate! Drink ${recommendedAmount}ml of water.`;
      new Notification('💧 Water Reminder', {
        body: notifBody,
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
        waterSkipped: 0,
        totalReminders: 0,
        bedtime: null,
        wakeTime: null,
        sleepHours: 0
      };
    }
    
    // Track total reminders shown
    wellnessData[dateKey].totalReminders = (wellnessData[dateKey].totalReminders || 0) + 1;
    
    if (drank) {
      wellnessData[dateKey].waterIntake++;
    } else {
      wellnessData[dateKey].waterSkipped = (wellnessData[dateKey].waterSkipped || 0) + 1;
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
