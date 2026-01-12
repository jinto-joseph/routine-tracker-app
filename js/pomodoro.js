let time = 25 * 60; // Default 25 minutes in seconds
let interval = null;
let isRunning = false;
let isPaused = false;
let sessionCount = 0;
let currentSessionType = 'pomodoro';
let pomodoroLapCount = 0; // Track pomodoro laps for long break
let customTotalTime = 0; // Store custom timer total time for progress

// Timer presets
const presets = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSessionCount();
  loadSessionHistory();
  updateSessionType();
  render();
  
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

function updateSessionType() {
  const selected = document.querySelector('input[name="sessionType"]:checked');
  if (selected) {
    currentSessionType = selected.value;
    time = presets[currentSessionType];
    render();
  }
}

window.startPomodoro = function() {
  if (isRunning && !isPaused) return;
  
  if (isPaused) {
    isPaused = false;
  } else {
    isRunning = true;
  }
  
  interval = setInterval(() => {
    if (time <= 0) {
      completeSession();
      return;
    }
    time--;
    render();
  }, 1000);
  
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('pauseBtn').style.display = 'inline-block';
  
  // Prevent screen sleep
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen');
  }
};

window.pausePomodoro = function() {
  if (!isRunning) return;
  
  clearInterval(interval);
  isPaused = true;
  document.getElementById('startBtn').style.display = 'inline-block';
  document.getElementById('pauseBtn').style.display = 'none';
};

window.resetPomodoro = function() {
  clearInterval(interval);
  isRunning = false;
  isPaused = false;
  
  // Reset to pomodoro session
  document.getElementById('pomodoro').checked = true;
  currentSessionType = 'pomodoro';
  time = presets.pomodoro;
  pomodoroLapCount = 0; // Reset lap count
  
  render();
  
  document.getElementById('startBtn').style.display = 'inline-block';
  document.getElementById('pauseBtn').style.display = 'none';
  
  // Release wake lock
  if ('wakeLock' in navigator && navigator.wakeLock.active) {
    navigator.wakeLock.release();
  }
};

function completeSession() {
  clearInterval(interval);
  
  // Play sound notification
  playNotificationSound();
  
  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Pomodoro Complete!', {
      body: currentSessionType === 'pomodoro' 
        ? 'Great work! Time for a break.' 
        : 'Break time is over. Ready to focus?',
      icon: '/favicon.ico'
    });
  }
  
  // Update session count and history
  if (currentSessionType === 'pomodoro' || currentSessionType === 'custom') {
    pomodoroLapCount++; // Increment lap count
    sessionCount++;
    saveSessionCount();
    addSessionToHistory();
  }
  
  // Auto-start break after pomodoro/custom or pomodoro after break
  if (currentSessionType === 'pomodoro' || currentSessionType === 'custom') {
    // After 4 pomodoros, take a long break
    const breakType = (pomodoroLapCount % 4 === 0) ? 'longBreak' : 'shortBreak';
    const breakName = (pomodoroLapCount % 4 === 0) ? 'Long Break! (15 min)' : 'Short Break! (5 min)';
    
    // Show notification first
    showNotificationMessage(`Great work! Starting ${breakName} in 3 seconds...`);
    
    // Wait 3 seconds then switch and auto-start
    setTimeout(() => {
      document.getElementById(breakType).checked = true;
      currentSessionType = breakType;
      time = presets[breakType];
      render();
      // Auto-start the break session
      isRunning = true;
      interval = setInterval(() => {
        if (time <= 0) {
          completeSession();
          return;
        }
        time--;
        render();
      }, 1000);
      document.getElementById('startBtn').style.display = 'none';
      document.getElementById('pauseBtn').style.display = 'inline-block';
    }, 3000);
  } else if (currentSessionType === 'shortBreak' || currentSessionType === 'longBreak') {
    // Auto-start pomodoro after break
    showNotificationMessage('Break over! Starting Pomodoro in 3 seconds...');
    
    // Wait 3 seconds then switch and auto-start
    setTimeout(() => {
      document.getElementById('pomodoro').checked = true;
      currentSessionType = 'pomodoro';
      time = presets.pomodoro;
      render();
      // Auto-start the pomodoro session
      isRunning = true;
      interval = setInterval(() => {
        if (time <= 0) {
          completeSession();
          return;
        }
        time--;
        render();
      }, 1000);
      document.getElementById('startBtn').style.display = 'none';
      document.getElementById('pauseBtn').style.display = 'inline-block';
    }, 3000);
  }
}

function render() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timer').textContent = display;
  
  // Update document title
  if (isRunning) {
    document.title = `${display} - Pomodoro Timer`;
  } else {
    document.title = 'Pomodoro Timer';
  }
  
  // Update progress ring (if you want to add visual progress)
  updateProgressRing();
}

function updateProgressRing() {
  const circle = document.getElementById('progressCircle');
  if (!circle) return;
  
  const timerElement = document.getElementById('timer');
  let totalTime;
  
  if (currentSessionType === 'custom') {
    totalTime = customTotalTime; // Use stored custom time
  } else {
    const selected = document.querySelector('input[name="sessionType"]:checked');
    if (selected) {
      totalTime = presets[selected.value];
    } else {
      totalTime = presets.pomodoro;
    }
  }
  
  const remaining = time;
  const progress = totalTime > 0 ? ((totalTime - remaining) / totalTime) : 0;
  
  const circumference = 2 * Math.PI * 140;
  const offset = circumference - (progress * circumference);
  circle.style.strokeDashoffset = offset;
  
  if (progress > 0.75) {
    circle.style.stroke = 'var(--success)';
    timerElement.style.color = 'var(--success)';
  } else if (progress > 0.5) {
    circle.style.stroke = 'var(--primary)';
    timerElement.style.color = 'var(--primary)';
  } else {
    circle.style.stroke = 'var(--warning)';
    timerElement.style.color = 'var(--text)';
  }
}

window.setCustomTimer = function() {
  console.log('setCustomTimer called');
  const minutesInput = document.getElementById('customMinutes');
  const secondsInput = document.getElementById('customSeconds');
  
  console.log('Minutes input:', minutesInput);
  console.log('Seconds input:', secondsInput);
  
  const minutes = parseInt(minutesInput.value) || 0;
  const seconds = parseInt(secondsInput.value) || 0;
  
  console.log('Minutes:', minutes, 'Seconds:', seconds);
  
  if (minutes === 0 && seconds === 0) {
    alert('Please set a valid time');
    return;
  }
  
  // Stop any running timer
  clearInterval(interval);
  isRunning = false;
  isPaused = false;
  
  // Set the custom time
  time = minutes * 60 + seconds;
  customTotalTime = time; // Store for progress tracking
  currentSessionType = 'custom';
  
  console.log('Custom time set to:', time, 'seconds');
  
  // Update UI
  render();
  document.getElementById('startBtn').style.display = 'inline-block';
  document.getElementById('pauseBtn').style.display = 'none';
  
  // Uncheck all preset radio buttons to show custom is active
  document.querySelectorAll('input[name="sessionType"]').forEach(radio => {
    radio.checked = false;
  });
  
  alert(`Custom timer set to ${minutes} minutes and ${seconds} seconds!`);
};

function showNotificationMessage(message) {
  const timerCard = document.getElementById('timer').parentElement;
  const notification = document.createElement('div');
  notification.className = 'alert alert-success text-center mb-3 pomodoro-notification';
  notification.style.animation = 'slideInDown 0.5s ease';
  notification.innerHTML = `<strong>${message}</strong>`;
  timerCard.prepend(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function playNotificationSound() {
  // Use different sounds for work and break sessions
  const isBreak = currentSessionType.includes('Break');
  const audioFile = isBreak ? '../break.mp3' : '../study.mp3';
  const audio = new Audio(audioFile);
  audio.volume = 0.7; // Set volume to 70%
  audio.play().catch(err => {
    console.error('Error playing notification sound:', err);
  });
}

function saveSessionCount() {
  const today = new Date().toISOString().split('T')[0];
  const data = JSON.parse(localStorage.getItem('pomodoroSessions') || '{}');
  data[today] = (data[today] || 0) + 1;
  localStorage.setItem('pomodoroSessions', JSON.stringify(data));
  const sessionCountEl = document.getElementById('sessionCount');
  if (sessionCountEl) {
    sessionCountEl.textContent = `Sessions Today: ${data[today]} | Lap: ${pomodoroLapCount % 4 === 0 ? 4 : pomodoroLapCount % 4}/4`;
  }
}

function loadSessionCount() {
  const today = new Date().toISOString().split('T')[0];
  const data = JSON.parse(localStorage.getItem('pomodoroSessions') || '{}');
  sessionCount = data[today] || 0;
  const sessionCountEl = document.getElementById('sessionCount');
  if (sessionCountEl) {
    const currentLap = (pomodoroLapCount % 4) || 4;
    sessionCountEl.textContent = `Sessions Today: ${sessionCount} | Lap: ${currentLap}/4`;
  }
}

function addSessionToHistory() {
  const now = new Date();
  // Map 'custom' to 'pomodoro' for display purposes
  const displayType = currentSessionType === 'custom' ? 'pomodoro' : currentSessionType;
  
  // Get selected category (only for pomodoro/custom sessions)
  let category = 'Other';
  if (displayType === 'pomodoro') {
    const categorySelect = document.getElementById('sessionCategory');
    if (categorySelect) {
      category = categorySelect.value;
    }
  }
  
  const session = {
    time: now.toLocaleTimeString(),
    type: displayType,
    category: category,
    date: now.toISOString()
  };
  
  const today = now.toISOString().split('T')[0];
  const history = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  if (!history[today]) {
    history[today] = [];
  }
  history[today].push(session);
  localStorage.setItem('pomodoroHistory', JSON.stringify(history));
  
  loadSessionHistory();
}

function loadSessionHistory() {
  const today = new Date().toISOString().split('T')[0];
  const history = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  const todaySessions = history[today] || [];
  
  const historyElement = document.getElementById('sessionHistory');
  
  if (todaySessions.length === 0) {
    historyElement.innerHTML = '<p class="text-muted text-center">No sessions completed today</p>';
    return;
  }
  
  historyElement.innerHTML = todaySessions.map((session, index) => {
    const typeBadge = session.type === 'pomodoro' 
      ? '<span class="badge bg-primary">Pomodoro</span>'
      : session.type === 'shortBreak'
      ? '<span class="badge bg-success">Short Break</span>'
      : '<span class="badge bg-info">Long Break</span>';
    
    const categoryBadge = session.category 
      ? `<span class="badge bg-secondary ms-2">${session.category}</span>` 
      : '';
    
    return `
      <div class="pomodoro-session">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            ${typeBadge}
            ${categoryBadge}
            <span class="ms-2">${session.time}</span>
          </div>
          <small class="text-muted">#${index + 1}</small>
        </div>
      </div>
    `;
  }).join('');
}

// Clear today's sessions
function clearTodaySessions() {
  if (!confirm('Are you sure you want to clear all of today\'s sessions? This cannot be undone.')) {
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const history = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  
  // Delete today's sessions
  delete history[today];
  
  // Save updated history
  localStorage.setItem('pomodoroHistory', JSON.stringify(history));
  
  // Reload the display
  loadSessionHistory();
  
  // Show success message
  const historyElement = document.getElementById('sessionHistory');
  historyElement.innerHTML = '<p class="text-success text-center"><i class="bi bi-check-circle"></i> Today\'s sessions cleared successfully!</p>';
  
  // Reset to default message after 2 seconds
  setTimeout(() => {
    loadSessionHistory();
  }, 2000);
}

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isRunning) {
    // Optionally pause when tab is hidden
    // pausePomodoro();
  }
});
