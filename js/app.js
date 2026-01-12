// Global state
let currentDate = new Date();
let routinesData = { daily: [], weekly: [] };
let reminderIntervals = [];

// DOM Elements
const routineBox = document.getElementById("dailyRoutine");
const weeklyBox = document.getElementById("weeklyRoutine");
const progressBar = document.getElementById("progressBar");
const progressValue = document.getElementById("progressValue");
const weeklyProgressBar = document.getElementById("weeklyProgressBar");
const weeklyProgressValue = document.getElementById("weeklyProgressValue");
const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const daySelect = document.getElementById("daySelect");
const currentDateDisplay = document.getElementById("currentDate");
const dailyProgressStat = document.getElementById("dailyProgressStat");
const weeklyProgressStat = document.getElementById("weeklyProgressStat");
const streakStat = document.getElementById("streakStat");
const dailyCount = document.getElementById("dailyCount");
const weeklyCount = document.getElementById("weeklyCount");

// Day names mapping
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeDateSelectors();
  loadRoutines();
  setupThemeToggle();
  setupReminders();
  setupRoutineManagement();
  updateCurrentDateDisplay();
  requestNotificationPermission(); // Request permission on load
  startReminderScheduler();
  startAutoMissedChecker(); // Start auto-marking missed routines
});

// Initialize date selectors
function initializeDateSelectors() {
const now = new Date();

  // Populate years (2020-2030)
  for (let y = 2020; y <= 2030; y++) {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
}
yearSelect.value = now.getFullYear();

  // Populate months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  months.forEach((m, i) => {
    monthSelect.innerHTML += `<option value="${i}">${m}</option>`;
  });
  monthSelect.value = now.getMonth();
  
  // Populate days and set to today
  updateDaySelector();
  
  // Set current date to today
  currentDate = new Date();
  
  // Event listeners
  yearSelect.addEventListener('change', () => {
    updateDaySelector();
    loadDateData();
  });
  monthSelect.addEventListener('change', () => {
    updateDaySelector();
    loadDateData();
  });
  daySelect.addEventListener('change', loadDateData);
  
  // Load today's data immediately
  loadDateData();
}

function updateDaySelector() {
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  daySelect.innerHTML = '';
  for (let d = 1; d <= daysInMonth; d++) {
    daySelect.innerHTML += `<option value="${d}">${d}</option>`;
  }
  
  const now = new Date();
  if (year === now.getFullYear() && month === now.getMonth()) {
    daySelect.value = now.getDate();
  } else {
    daySelect.value = 1;
  }
}

function updateCurrentDateDisplay() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// Load routines from JSON
function loadRoutines() {
  console.log('🔄 Loading routines...');
  
  // Try to load from localStorage first (faster, works offline)
  const savedRoutines = loadRoutinesFromStorage();
  if (savedRoutines && savedRoutines.daily && savedRoutines.daily.length > 0) {
    routinesData = savedRoutines;
    console.log(`✅ Loaded ${savedRoutines.daily.length} routines from localStorage`);
    
    // Set date and load immediately
    const today = new Date();
    if (yearSelect && monthSelect && daySelect) {
      yearSelect.value = today.getFullYear();
      monthSelect.value = today.getMonth();
      updateDaySelector();
      currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else {
      currentDate = new Date();
    }
    loadDateData();
  } else if (typeof embeddedRoutinesData !== 'undefined' && embeddedRoutinesData.daily) {
    // Use embedded routines as fallback
    routinesData = embeddedRoutinesData;
    localStorage.setItem('routinesData', JSON.stringify(embeddedRoutinesData));
    console.log(`✅ Using embedded routines: ${embeddedRoutinesData.daily.length} routines`);
    
    const today = new Date();
    if (yearSelect && monthSelect && daySelect) {
      yearSelect.value = today.getFullYear();
      monthSelect.value = today.getMonth();
      updateDaySelector();
      currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else {
      currentDate = new Date();
    }
    loadDateData();
  }
  
  // Then try to update from file (for latest changes)
  fetch("../data/routines.json")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      if (!data || !data.daily || !Array.isArray(data.daily)) {
        throw new Error('Invalid routines data structure');
      }
      
      // Always use the file data (latest routines)
      routinesData = data;
      
      // Update localStorage with latest routines from file
      localStorage.setItem('routinesData', JSON.stringify(data));
      console.log(`✅ Updated with ${data.daily.length} routines from file`);
      
      // Reload the display with updated routines
      if (yearSelect && monthSelect && daySelect) {
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);
        const day = parseInt(daySelect.value);
        currentDate = new Date(year, month, day);
      }
      loadDateData();
    })
    .catch(err => {
      console.warn("⚠ Could not load from file (this is OK if using file:// protocol):", err.message);
      // If we don't have routines yet, use embedded
      if (!routinesData || !routinesData.daily || routinesData.daily.length === 0) {
        if (typeof embeddedRoutinesData !== 'undefined' && embeddedRoutinesData.daily) {
          routinesData = embeddedRoutinesData;
          localStorage.setItem('routinesData', JSON.stringify(embeddedRoutinesData));
          console.log(`✅ Using embedded routines as fallback: ${embeddedRoutinesData.daily.length} routines`);
          loadDateData();
        } else {
          console.error("❌ No routines available!");
          if (routineBox) {
            routineBox.innerHTML = `
              <div class="p-4 text-center">
                <div class="alert alert-danger">
                  <i class="bi bi-exclamation-triangle"></i> 
                  <strong>Could not load routines!</strong><br>
                  <small>Please use a local server (see README) or check browser console.</small><br>
                  <button class="btn btn-primary mt-2" onclick="reloadRoutines()">
                    <i class="bi bi-arrow-clockwise"></i> Try Again
                  </button>
                </div>
              </div>
            `;
          }
        }
      }
    });
}

// Get routines for specific day
function getRoutinesForDay(dayName) {
  if (!routinesData || !routinesData.daily || routinesData.daily.length === 0) {
    console.warn('⚠ No routines data available!');
    return [];
  }
  
  const dayLower = dayName.toLowerCase();
  console.log(`🔍 Looking for routines on: ${dayLower}`);
  console.log(`📊 Total routines in data: ${routinesData.daily.length}`);
  
  const filtered = routinesData.daily.filter(routine => {
    if (!routine.days || !Array.isArray(routine.days)) {
      return false;
    }
    return routine.days.includes(dayLower);
  });
  
  console.log(`✅ Found ${filtered.length} routines for ${dayLower}`);
  
  // Sort routines by time (defaultTime)
  // Special handling: 00:00 (midnight) should come last as it's the end of the day
  return filtered.sort((a, b) => {
    const timeA = a.defaultTime || "00:00";
    const timeB = b.defaultTime || "00:00";
    
    // Convert 00:00 to 24:00 for sorting purposes (so it comes last)
    const sortTimeA = timeA === "00:00" ? "24:00" : timeA;
    const sortTimeB = timeB === "00:00" ? "24:00" : timeB;
    
    return sortTimeA.localeCompare(sortTimeB);
  });
}

// Load data for selected date
function loadDateData() {
  // Check if routines are loaded first
  if (!routinesData || !routinesData.daily || routinesData.daily.length === 0) {
    console.warn('⚠ Routines not loaded yet, trying to load from localStorage...');
    const saved = loadRoutinesFromStorage();
    if (saved && saved.daily && saved.daily.length > 0) {
      routinesData = saved;
      console.log(`✅ Loaded ${saved.daily.length} routines from localStorage`);
    } else {
      console.error('❌ No routines available! Please refresh the page.');
      if (routineBox) {
        routineBox.innerHTML = `
          <div class="p-4 text-center">
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle"></i> 
              <strong>Routines not loaded!</strong><br>
              Please refresh the page or check the console for errors.
            </div>
          </div>
        `;
      }
      return;
    }
  }
  
  // If date selectors are initialized, use their values
  if (yearSelect && monthSelect && daySelect) {
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const day = parseInt(daySelect.value);
    currentDate = new Date(year, month, day);
  } else {
    // Otherwise, default to today
    currentDate = new Date();
  }
  
  const dayIndex = currentDate.getDay();
  const dayName = dayNames[dayIndex];
  const dayRoutines = getRoutinesForDay(dayName);
  
  // Debug: Log routines found
  const dateStr = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  console.log(`📅 Date: ${dateStr}`);
  console.log(`📆 Day Index: ${dayIndex}, Day Name: ${dayName}`);
  console.log(`📋 Routines found: ${dayRoutines.length}`);
  
  if (dayRoutines.length > 0) {
    console.log('✅ Routines for this day:', dayRoutines.map(r => `${r.name} @ ${r.defaultTime}`));
  } else {
    console.warn(`⚠ No routines found for ${dayName}`);
  }
  
  const dateKey = getDateKey(currentDate);
  const savedData = getSavedData(dateKey);
  
  loadDailyRoutine(dayRoutines, savedData.daily || {});
  loadWeeklyRoutine(savedData.weekly || {});
  updateStats(dayRoutines);
  
  // Update the display to show which day is selected
  const dayDisplay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  console.log(`✓ Display updated for ${dayDisplay} - ${dayRoutines.length} routines`);
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isDateToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function getSavedData(dateKey) {
  const allData = JSON.parse(localStorage.getItem('routineTracker') || '{}');
  return allData[dateKey] || { daily: {}, weekly: {} };
}

function saveData(dateKey, data) {
  const allData = JSON.parse(localStorage.getItem('routineTracker') || '{}');
  allData[dateKey] = data;
  localStorage.setItem('routineTracker', JSON.stringify(allData));
}

// Load daily routine
function loadDailyRoutine(routines, savedData) {
  // Hide loading indicator
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  routineBox.innerHTML = '';
  
  if (!routines || routines.length === 0) {
    const dayName = dayNames[currentDate.getDay()];
    const dayDisplay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    routineBox.innerHTML = `
      <div class="p-4 text-center">
        <i class="bi bi-calendar-x" style="font-size: 3rem; color: var(--text); opacity: 0.5;"></i>
        <p class="mt-3 text-muted">No routines scheduled for <strong>${dayDisplay}</strong></p>
        <p class="text-muted small">Click "Edit Routines" to see all routines or "Add Routines" to create new ones.</p>
        <button class="btn btn-primary btn-sm mt-2" onclick="reloadRoutines()">
          <i class="bi bi-arrow-clockwise"></i> Reload Routines
        </button>
      </div>
    `;
    return;
  }
  
  // Show day info header
  const dayName = dayNames[currentDate.getDay()];
  const dayDisplay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const dateStr = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isToday = isDateToday(currentDate);
  
  // Update badge in header
  const currentDayBadge = document.getElementById('currentDayBadge');
  if (currentDayBadge) {
    currentDayBadge.textContent = isToday ? 'Today' : dayDisplay;
    currentDayBadge.className = isToday ? 'badge bg-success ms-2' : 'badge bg-light text-dark ms-2';
  }
  
  const headerInfo = document.createElement('div');
  headerInfo.className = `p-3 border-bottom ${isToday ? 'bg-success bg-opacity-10' : 'bg-light'}`;
  headerInfo.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <i class="bi bi-calendar3"></i> <strong>${dayDisplay}</strong> - ${dateStr}
        ${isToday ? '<span class="badge bg-success ms-2">Today</span>' : ''}
      </div>
      <small class="text-muted">${routines.length} routine${routines.length !== 1 ? 's' : ''} scheduled</small>
    </div>
  `;
  routineBox.appendChild(headerInfo);
  
  routines.forEach((routine, index) => {
    const routineId = `${routine.name}-${routine.defaultTime}`;
    const savedRoutine = savedData[routineId] || { completed: false, timeSpent: 0 };
    const isChecked = savedRoutine.completed;
    const timeSpent = savedRoutine.timeSpent || 0;
    const goal = routine.goal || 0;
    
    const routineItem = document.createElement('div');
    routineItem.className = `routine-item ${isChecked ? 'completed' : ''}`;
    
    const goalDisplay = goal > 0 ? `<span class="badge bg-info ms-2">Goal: ${goal} min</span>` : '';
    const timeInput = goal > 0 ? `
      <div class="mt-2">
        <label class="form-label small">Time Spent (minutes):</label>
        <input type="number" class="form-control form-control-sm" 
               id="time-${index}" 
               value="${timeSpent}" 
               min="0" 
               onchange="updateRoutineTime(${index}, '${routineId}')"
               style="max-width: 150px;">
        <small class="text-muted">${goal > 0 ? `Target: ${goal} min` : ''}</small>
      </div>
    ` : '';
    
    const progressBar = goal > 0 && timeSpent > 0 ? `
      <div class="mt-2">
        <div class="progress" style="height: 8px;">
          <div class="progress-bar ${timeSpent >= goal ? 'bg-success' : 'bg-warning'}" 
               style="width: ${Math.min((timeSpent / goal) * 100, 100)}%"></div>
        </div>
        <small class="text-muted">${Math.round((timeSpent / goal) * 100)}% of goal</small>
      </div>
    ` : '';
    
    const categoryBadge = routine.category ? `<span class="badge bg-secondary ms-2">${routine.category}</span>` : '';
    const savedStatus = savedRoutine.status || 'none'; // 'completed', 'missed', 'none'
    
    let statusIcon = '<i class="bi bi-circle"></i>';
    let statusClass = '';
    if (savedStatus === 'completed') {
      statusIcon = '<i class="bi bi-check-circle-fill text-success"></i>';
      statusClass = 'completed';
    } else if (savedStatus === 'missed') {
      statusIcon = '<i class="bi bi-x-circle-fill text-danger"></i>';
      statusClass = 'missed';
    }
    
    routineItem.className = `routine-item ${statusClass}`;
    
    routineItem.innerHTML = `
      <div class="routine-item-content">
        <div class="d-flex align-items-start">
          <div class="routine-status-wrapper">
            <button class="btn-status btn-complete" onclick="markRoutineStatus(${index}, '${routineId}', 'completed')" title="Mark as Completed">
              <i class="bi bi-check-circle${savedStatus === 'completed' ? '-fill' : ''}"></i>
            </button>
            <button class="btn-status btn-missed" onclick="markRoutineStatus(${index}, '${routineId}', 'missed')" title="Mark as Missed">
              <i class="bi bi-x-circle${savedStatus === 'missed' ? '-fill' : ''}"></i>
            </button>
            <button class="btn-status btn-clear" onclick="markRoutineStatus(${index}, '${routineId}', 'none')" title="Clear Status">
              <i class="bi bi-circle"></i>
            </button>
          </div>
          <div class="flex-grow-1 ms-3">
            <div class="d-flex align-items-center flex-wrap">
              <h6 class="mb-0 routine-name ${statusClass}">${routine.name}</h6>
              ${categoryBadge}
              ${goalDisplay}
            </div>
            <div class="mt-1">
              <small class="text-muted">
                <i class="bi bi-clock"></i> ${routine.defaultTime}
              </small>
            </div>
            ${timeInput}
            ${progressBar}
          </div>
        </div>
      </div>
    `;
    routineBox.appendChild(routineItem);
  });
  
  updateDailyProgress();
}

// Load weekly routine
function loadWeeklyRoutine(savedData) {
  weeklyBox.innerHTML = '';
  const tasks = routinesData.weekly || [];
  
  if (tasks.length === 0) {
    weeklyBox.innerHTML = '<div class="p-3 text-center text-muted">No weekly routines</div>';
    return;
  }
  
  tasks.forEach((task, index) => {
    const isChecked = savedData[index] || false;
    const routineItem = document.createElement('div');
    routineItem.className = `routine-item ${isChecked ? 'completed' : ''}`;
    routineItem.innerHTML = `
      <div class="form-check flex-grow-1">
        <input class="form-check-input" type="checkbox" id="weekly-${index}" 
               ${isChecked ? 'checked' : ''} 
               onchange="updateWeeklyProgress(${index})">
        <label class="form-check-label" for="weekly-${index}">
          <strong>${task.name || task}</strong>
          ${task.goal > 0 ? `<span class="badge bg-info ms-2">Goal: ${task.goal} min</span>` : ''}
          ${task.defaultTime ? `<small class="text-muted d-block">⏰ ${task.defaultTime}</small>` : ''}
        </label>
      </div>
    `;
    weeklyBox.appendChild(routineItem);
  });
  
  updateWeeklyProgress();
}

// Update routine time spent
window.updateRoutineTime = function(index, routineId) {
  const timeInput = document.getElementById(`time-${index}`);
  const timeSpent = parseInt(timeInput.value) || 0;
  
  const dateKey = getDateKey(currentDate);
  const savedData = getSavedData(dateKey);
  savedData.daily = savedData.daily || {};
  
  if (!savedData.daily[routineId]) {
    savedData.daily[routineId] = { completed: false, timeSpent: 0 };
  }
  savedData.daily[routineId].timeSpent = timeSpent;
  
  saveData(dateKey, savedData);
  loadDateData(); // Reload to update progress bars
};

// Mark routine status (completed, missed, or none)
window.markRoutineStatus = function(index, routineId, status) {
  const dateKey = getDateKey(currentDate);
  const savedData = getSavedData(dateKey);
  savedData.daily = savedData.daily || {};
  
  if (!savedData.daily[routineId]) {
    savedData.daily[routineId] = { completed: false, timeSpent: 0, status: 'none' };
  }
  
  savedData.daily[routineId].status = status;
  savedData.daily[routineId].completed = (status === 'completed');
  
  saveData(dateKey, savedData);
  
  // Special handling for wellness tracking
  if (status === 'completed') {
    const routineName = routineId.split('-').slice(0, -1).join('-'); // Remove time part
    
    // Track bedtime when Sleep routine is marked complete
    if (routineName.toLowerCase().includes('sleep')) {
      if (typeof wellnessTracker !== 'undefined') {
        wellnessTracker.recordBedtime();
      }
    }
    
    // Track wake time when Wake up routine is marked complete
    if (routineName.toLowerCase().includes('wake up')) {
      if (typeof wellnessTracker !== 'undefined') {
        wellnessTracker.recordWakeTime();
      }
    }
  }
  
  // Reload to update UI
  loadDateData();
  
  // Play sound for completed
  if (status === 'completed') {
    playSuccessSound();
  } else if (status === 'missed') {
    playMissedSound();
  }
};

// Update daily progress
window.updateDailyProgress = function(index, routineId) {
  if (index === undefined) {
    // Just recalculate progress
    const dayName = dayNames[currentDate.getDay()];
    const dayRoutines = getRoutinesForDay(dayName);
    updateStats(dayRoutines);
    return;
  }
  
  const dateKey = getDateKey(currentDate);
  const savedData = getSavedData(dateKey);
  savedData.daily = savedData.daily || {};
  
  if (!savedData.daily[routineId]) {
    savedData.daily[routineId] = { completed: false, timeSpent: 0, status: 'none' };
  }
  
  // This function is kept for backward compatibility
  const dayName = dayNames[currentDate.getDay()];
  const dayRoutines = getRoutinesForDay(dayName);
  updateStats(dayRoutines);
};

// Update weekly progress
window.updateWeeklyProgress = function(index) {
  const dateKey = getDateKey(currentDate);
  const savedData = getSavedData(dateKey);
  
  const weeklyCheckbox = document.getElementById(`weekly-${index}`);
  if (!weeklyCheckbox) {
    console.warn(`Weekly checkbox weekly-${index} not found`);
    return;
  }
  
  savedData.weekly = savedData.weekly || {};
  savedData.weekly[index] = weeklyCheckbox.checked;
  saveData(dateKey, savedData);
  
  const checks = document.querySelectorAll('#weeklyRoutine .form-check-input');
  const done = Array.from(checks).filter(c => c.checked).length;
  const total = checks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  
  weeklyProgressBar.style.width = percent + "%";
  weeklyProgressValue.textContent = percent + "%";
  weeklyCount.textContent = `${done}/${total}`;
  
  checks.forEach((check, i) => {
    const item = check.closest('.routine-item');
    if (check.checked) {
      item.classList.add('completed');
    } else {
      item.classList.remove('completed');
    }
  });
  
  updateStats();
};

// Update statistics
function updateStats(dayRoutines = null) {
  const dateKey = getDateKey(currentDate);
  const savedData = getSavedData(dateKey);
  
  if (!dayRoutines) {
    const dayName = dayNames[currentDate.getDay()];
    dayRoutines = getRoutinesForDay(dayName);
  }
  
  // Daily progress - based on completion and goals
  let totalGoal = 0;
  let totalTimeSpent = 0;
  let completedCount = 0;
  let missedCount = 0;
  
  dayRoutines.forEach(routine => {
    const routineId = `${routine.name}-${routine.defaultTime}`;
    const savedRoutine = savedData.daily[routineId] || { completed: false, timeSpent: 0, status: 'none' };
    
    if (routine.goal > 0) {
      totalGoal += routine.goal;
      totalTimeSpent += savedRoutine.timeSpent || 0;
    }
    
    // Check status to determine if completed or missed
    const status = savedRoutine.status || (savedRoutine.completed ? 'completed' : 'none');
    if (status === 'completed') {
      completedCount++;
    } else if (status === 'missed') {
      missedCount++;
    }
  });
  
  // Calculate progress: 50% from completion, 50% from goal achievement
  // Penalize for missed routines: each missed routine reduces percentage
  const totalRoutines = dayRoutines.length;
  let completionPercent = 0;
  if (totalRoutines > 0) {
    // Base completion: (completed / total) * 100
    // Penalty: each missed routine reduces by (100 / total)
    const basePercent = (completedCount / totalRoutines) * 100;
    const penaltyPercent = (missedCount / totalRoutines) * 100;
    completionPercent = Math.max(0, Math.round(basePercent - penaltyPercent));
  }
  
  const goalPercent = totalGoal > 0 
    ? Math.round((totalTimeSpent / totalGoal) * 100) 
    : 0;
  const dailyPercent = Math.max(0, Math.round((completionPercent + goalPercent) / 2));
  
  progressBar.style.width = dailyPercent + "%";
  progressValue.textContent = dailyPercent + "%";
  dailyCount.textContent = `${completedCount}/${dayRoutines.length}`;
  dailyProgressStat.textContent = dailyPercent + "%";
  
  // Weekly progress
  const weeklyChecks = document.querySelectorAll('#weeklyRoutine .form-check-input');
  const weeklyDone = Array.from(weeklyChecks).filter(c => c.checked).length;
  const weeklyTotal = weeklyChecks.length;
  const weeklyPercent = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 0;
  weeklyProgressStat.textContent = weeklyPercent + "%";
  
  // Calculate streak
  const streak = calculateStreak();
  streakStat.textContent = streak;
}

// Calculate current streak
// Streak Calculation Logic:
// - Counts consecutive days where at least 50% of routines were completed
// - Starts from today and goes backwards through history
// - Breaks when a day has less than 50% completion
// - Days with no scheduled routines are skipped (not counted as break)
// - Example: If you have 10 routines and complete 5+, the day counts toward streak
function calculateStreak() {
  const allData = JSON.parse(localStorage.getItem('routineTracker') || '{}');
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateKey = getDateKey(checkDate);
    const dayData = allData[dateKey];
    const dayName = dayNames[checkDate.getDay()];
    const dayRoutines = getRoutinesForDay(dayName);
    
    if (dayData && dayData.daily && dayRoutines.length > 0) {
      let completedCount = 0;
      dayRoutines.forEach(routine => {
        const routineId = `${routine.name}-${routine.defaultTime}`;
        if (dayData.daily[routineId] && dayData.daily[routineId].completed) {
          completedCount++;
        }
      });
      
      // Day counts if at least 50% of routines are completed
      if (completedCount >= dayRoutines.length * 0.5) {
        streak++;
      } else {
        break; // Streak broken
      }
    } else if (dayRoutines.length === 0) {
      // No routines for this day, skip it (don't break streak)
      continue;
    } else {
      break; // No data for this day, streak broken
    }
  }
  
  return streak;
}

// Theme Toggle
function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Ensure theme is applied
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Per-routine reminders
function setupReminders() {
  const reminderBtn = document.getElementById("reminderBtn");
  
  reminderBtn.onclick = () => {
    const modal = new bootstrap.Modal(document.getElementById('reminderModal'));
    loadReminderSettings();
    modal.show();
  };
  
  document.getElementById('saveReminders').onclick = () => {
    saveReminderSettings();
    bootstrap.Modal.getInstance(document.getElementById('reminderModal')).hide();
    showNotification('Reminder settings saved!');
    startReminderScheduler();
  };
  
  // Request permission on load
  requestNotificationPermission();
}

function loadReminderSettings() {
  const reminderSettings = JSON.parse(localStorage.getItem('reminderSettings') || '{}');
  const container = document.getElementById('reminderList');
  container.innerHTML = '';
  
  // Get all unique routines with their times
  const routineMap = new Map();
  routinesData.daily.forEach(routine => {
    const key = `${routine.name}-${routine.defaultTime}`;
    if (!routineMap.has(key)) {
      routineMap.set(key, {
        name: routine.name,
        time: routine.defaultTime,
        enabled: reminderSettings[key]?.enabled || false
      });
    }
  });
  
  routineMap.forEach((routine, key) => {
    const div = document.createElement('div');
    div.className = 'mb-3 p-3 border rounded';
    div.innerHTML = `
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="reminder-${key}" ${routine.enabled ? 'checked' : ''}>
        <label class="form-check-label" for="reminder-${key}">
          <strong>${routine.name}</strong>
          <span class="badge bg-primary ms-2">${routine.time}</span>
        </label>
      </div>
    `;
    container.appendChild(div);
  });
}

function saveReminderSettings() {
  const reminderSettings = {};
  const container = document.getElementById('reminderList');
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    const key = checkbox.id.replace('reminder-', '');
    reminderSettings[key] = {
      enabled: checkbox.checked
    };
  });
  
  localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
}

function startReminderScheduler() {
  // Clear existing intervals
  reminderIntervals.forEach(interval => clearInterval(interval));
  reminderIntervals = [];
  
  const reminderSettings = JSON.parse(localStorage.getItem('reminderSettings') || '{}');
  const now = new Date();
  const dayName = dayNames[now.getDay()];
  const dayRoutines = getRoutinesForDay(dayName);
  
  dayRoutines.forEach(routine => {
    const key = `${routine.name}-${routine.defaultTime}`;
    const setting = reminderSettings[key];
    
    if (setting && setting.enabled) {
      const [hours, minutes] = routine.defaultTime.split(':').map(Number);
      
      // Schedule reminder for this routine
      const interval = setInterval(() => {
        const now = new Date();
        const currentDay = dayNames[now.getDay()];
        const currentRoutines = getRoutinesForDay(currentDay);
        
        // Check if this routine is active today
        const isActive = currentRoutines.some(r => 
          r.name === routine.name && r.defaultTime === routine.defaultTime
        );
        
        if (isActive && now.getHours() === hours && now.getMinutes() === minutes && now.getSeconds() === 0) {
          playAlarmSound();
          showAlarmModal(routine);
          showBrowserNotification(
            `⏰ Time for ${routine.name}!`,
            `It's ${routine.defaultTime} - ${routine.goal > 0 ? `Goal: ${routine.goal} minutes` : 'Time to start!'}`,
            true
          );
          showNotification(`⏰ ${routine.name} - ${routine.defaultTime}`);
        }
      }, 1000); // Check every second for precise timing
      
      reminderIntervals.push(interval);
    }
  });
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title, body, isAlarm = false) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: isAlarm, // Keep notification visible for alarms
      tag: isAlarm ? 'routine-alarm' : 'routine-reminder'
    });
    
    // Play appropriate sound
    if (isAlarm) {
      playAlarmSound();
    } else {
      playReminderSound();
    }
  }
}

// Sound functions
function playAlarmSound() {
  // Play study.mp3 for all routine reminders
  const audio = new Audio('../study.mp3');
  audio.volume = 0.7;
  audio.play().catch(err => {
    console.error('Error playing alarm sound:', err);
    // Fallback to beep if audio file fails
    playBeepFallback();
  });
}

function playBeepFallback() {
  // Fallback beep sound if audio file not available
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Play multiple beeps in sequence for alarm effect
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // A5 note - higher pitch for alarm
      oscillator.type = 'square'; // Square wave for sharper alarm sound
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }, i * 400); // 400ms between beeps
  }
}

function playReminderSound() {
  // Use study.mp3 for event reminders
  playAlarmSound();
}

function playSuccessSound() {
  playTone(523, 100, 0.2); // C
  setTimeout(() => playTone(659, 100, 0.2), 100); // E
  setTimeout(() => playTone(784, 200, 0.3), 200); // G
}

function playMissedSound() {
  playTone(400, 300, 0.2);
}

function playTone(frequency, duration, volume) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

function showNotification(message) {
  const badge = document.getElementById('notificationBadge');
  badge.textContent = message;
  badge.style.display = 'block';
  setTimeout(() => {
    badge.style.display = 'none';
  }, 3000);
}

function showAlarmModal(routine) {
  const alarmModal = document.getElementById('alarmModal');
  const modalInstance = new bootstrap.Modal(alarmModal);
  
  // Populate modal content
  document.getElementById('alarmRoutineName').textContent = routine.name;
  document.getElementById('alarmRoutineTime').textContent = routine.defaultTime;
  document.getElementById('alarmRoutineGoal').textContent = routine.goal > 0 
    ? `Goal: ${routine.goal} minutes` 
    : 'Time to start your routine!';
  
  // Show the modal
  modalInstance.show();
  
  // Handle dismiss button
  document.getElementById('dismissAlarm').onclick = () => {
    modalInstance.hide();
  };
}

// Routine Management
function setupRoutineManagement() {
  const editBtn = document.getElementById('editRoutinesBtn');
  const addBtn = document.getElementById('addRoutinesBtn');
  
  if (editBtn) {
    editBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      loadAllRoutines();
      const modal = new bootstrap.Modal(document.getElementById('manageRoutinesModal'));
      modal.show();
    });
  }
  
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      addNewRoutine();
    });
  }
}

function loadAllRoutines() {
  const container = document.getElementById('allRoutinesList');
  container.innerHTML = '';
  
  // Add summary
  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'alert alert-success mb-4';
  const totalRoutines = routinesData.daily.length;
  const weekdaysOnly = routinesData.daily.filter(r => 
    r.days.every(d => ['monday','tuesday','wednesday','thursday','friday'].includes(d)) &&
    !r.days.some(d => ['saturday','sunday'].includes(d))
  ).length;
  const weekendsOnly = routinesData.daily.filter(r => 
    r.days.some(d => ['saturday','sunday'].includes(d)) &&
    !r.days.some(d => ['monday','tuesday','wednesday','thursday','friday'].includes(d))
  ).length;
  const everyday = routinesData.daily.filter(r => 
    r.days.length === 7
  ).length;
  
  summaryDiv.innerHTML = `
    <h6><i class="bi bi-check-circle"></i> All Your Routines Loaded!</h6>
    <div class="row mt-2">
      <div class="col-md-3"><strong>Total:</strong> ${totalRoutines} routines</div>
      <div class="col-md-3"><strong>Weekdays Only:</strong> ${weekdaysOnly}</div>
      <div class="col-md-3"><strong>Weekends:</strong> ${weekendsOnly}</div>
      <div class="col-md-3"><strong>Everyday:</strong> ${everyday}</div>
    </div>
    <small class="text-muted mt-2 d-block">All routines from your Mon-Fri, Saturday, and Sunday schedules are included.</small>
  `;
  container.appendChild(summaryDiv);
  
  // Group routines by category
  const byCategory = {};
  routinesData.daily.forEach((routine, index) => {
    const category = routine.category || 'Other';
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push({ ...routine, index });
  });
  
  Object.keys(byCategory).sort().forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'mb-4';
    categoryDiv.innerHTML = `
      <h6 class="text-primary mb-3">
        <i class="bi bi-folder"></i> ${category} <span class="badge bg-secondary">${byCategory[category].length}</span>
      </h6>
    `;
    
    const routinesDiv = document.createElement('div');
    routinesDiv.className = 'row g-3';
    
    byCategory[category].forEach(({ name, goal, defaultTime, days, index }) => {
      const daysStr = days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
      const dayBadges = days.map(day => {
        const dayColors = {
          'monday': 'primary',
          'tuesday': 'primary', 
          'wednesday': 'primary',
          'thursday': 'primary',
          'friday': 'primary',
          'saturday': 'success',
          'sunday': 'warning'
        };
        return `<span class="badge bg-${dayColors[day] || 'secondary'} me-1">${day.charAt(0).toUpperCase() + day.slice(1).substring(0, 3)}</span>`;
      }).join('');
      
      const routineCard = document.createElement('div');
      routineCard.className = 'col-md-6 col-lg-4';
      routineCard.innerHTML = `
        <div class="card h-100 routine-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0 flex-grow-1">${name}</h6>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="editRoutine(${index})" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="deleteRoutine(${index})" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <p class="card-text small mb-2">
              <i class="bi bi-clock text-primary"></i> <strong>Time:</strong> ${defaultTime}
              ${goal > 0 ? `<span class="badge bg-info ms-2">${goal} min goal</span>` : ''}
            </p>
            <p class="card-text small mb-0">
              <i class="bi bi-calendar text-success"></i> <strong>Days:</strong><br>
              ${dayBadges}
            </p>
          </div>
        </div>
      `;
      routinesDiv.appendChild(routineCard);
    });
    
    categoryDiv.appendChild(routinesDiv);
    container.appendChild(categoryDiv);
  });
  
  // Add weekly routines section
  if (routinesData.weekly.length > 0) {
    const weeklyDiv = document.createElement('div');
    weeklyDiv.className = 'mb-4';
    weeklyDiv.innerHTML = `
      <h6 class="text-success mb-3">
        <i class="bi bi-calendar-week"></i> Weekly Routines
      </h6>
    `;
    
    const weeklyRoutinesDiv = document.createElement('div');
    weeklyRoutinesDiv.className = 'row g-3';
    
    routinesData.weekly.forEach((routine, index) => {
      const daysStr = (routine.days || []).join(', ').replace(/\b\w/g, l => l.toUpperCase());
      const routineCard = document.createElement('div');
      routineCard.className = 'col-md-6';
      routineCard.innerHTML = `
        <div class="card h-100 routine-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0">${routine.name}</h6>
              <div>
                <button class="btn btn-sm btn-outline-primary" onclick="editWeeklyRoutine(${index})">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteWeeklyRoutine(${index})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <p class="card-text small mb-1">
              <i class="bi bi-clock"></i> <strong>Time:</strong> ${routine.defaultTime || 'N/A'}
            </p>
            <p class="card-text small mb-1">
              <i class="bi bi-target"></i> <strong>Goal:</strong> ${routine.goal > 0 ? routine.goal + ' min' : 'No goal'}
            </p>
            <p class="card-text small mb-0">
              <i class="bi bi-calendar"></i> <strong>Days:</strong> ${daysStr || 'N/A'}
            </p>
          </div>
        </div>
      `;
      weeklyRoutinesDiv.appendChild(routineCard);
    });
    
    weeklyDiv.appendChild(weeklyRoutinesDiv);
    container.appendChild(weeklyDiv);
  }
}

window.addNewRoutine = function() {
  document.getElementById('editRoutineTitle').innerHTML = '<i class="bi bi-plus-circle"></i> Add New Routine';
  document.getElementById('routineForm').reset();
  document.getElementById('routineIndex').value = '-1';
  document.getElementById('routineCategory').value = 'Morning';
  
  // Uncheck all days
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = false;
  });
  
  const modal = new bootstrap.Modal(document.getElementById('editRoutineModal'));
  modal.show();
};

window.editRoutine = function(index) {
  const routine = routinesData.daily[index];
  if (!routine) return;
  
  document.getElementById('editRoutineTitle').innerHTML = '<i class="bi bi-pencil"></i> Edit Routine';
  document.getElementById('routineName').value = routine.name;
  document.getElementById('routineGoal').value = routine.goal || 0;
  document.getElementById('routineTime').value = routine.defaultTime;
  document.getElementById('routineCategory').value = routine.category || 'Morning';
  document.getElementById('routineIndex').value = index;
  
  // Check selected days
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = routine.days.includes(day);
  });
  
  const modal = new bootstrap.Modal(document.getElementById('editRoutineModal'));
  modal.show();
};

window.deleteRoutine = function(index) {
  if (confirm('Are you sure you want to delete this routine?')) {
    routinesData.daily.splice(index, 1);
    saveRoutinesToFile();
    loadAllRoutines();
    loadDateData();
    showNotification('Routine deleted!');
  }
};

window.editWeeklyRoutine = function(index) {
  const routine = routinesData.weekly[index];
  if (!routine) return;
  
  document.getElementById('editRoutineTitle').innerHTML = '<i class="bi bi-pencil"></i> Edit Weekly Routine';
  document.getElementById('routineName').value = routine.name;
  document.getElementById('routineGoal').value = routine.goal || 0;
  document.getElementById('routineTime').value = routine.defaultTime || '12:00';
  document.getElementById('routineCategory').value = routine.category || 'Planning';
  document.getElementById('routineIndex').value = `weekly-${index}`;
  
  // Check selected days
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = (routine.days || []).includes(day);
  });
  
  const modal = new bootstrap.Modal(document.getElementById('editRoutineModal'));
  modal.show();
};

window.deleteWeeklyRoutine = function(index) {
  if (confirm('Are you sure you want to delete this weekly routine?')) {
    routinesData.weekly.splice(index, 1);
    saveRoutinesToFile();
    loadAllRoutines();
    showNotification('Weekly routine deleted!');
  }
};

window.saveRoutine = function() {
  const name = document.getElementById('routineName').value;
  const goal = parseInt(document.getElementById('routineGoal').value) || 0;
  const time = document.getElementById('routineTime').value;
  const category = document.getElementById('routineCategory').value;
  const index = document.getElementById('routineIndex').value;
  
  const selectedDays = [];
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
    if (document.getElementById(`day-${day}`).checked) {
      selectedDays.push(day);
    }
  });
  
  if (!name || selectedDays.length === 0) {
    alert('Please fill in all required fields!');
    return;
  }
  
  const routine = {
    name,
    goal,
    defaultTime: time,
    days: selectedDays,
    category
  };
  
  if (index.startsWith('weekly-')) {
    const weeklyIndex = parseInt(index.replace('weekly-', ''));
    routinesData.weekly[weeklyIndex] = routine;
  } else if (index === '-1') {
    routinesData.daily.push(routine);
  } else {
    routinesData.daily[parseInt(index)] = routine;
  }
  
  saveRoutinesToFile();
  bootstrap.Modal.getInstance(document.getElementById('editRoutineModal')).hide();
  loadAllRoutines();
  loadDateData();
  showNotification('Routine saved!');
};

window.saveAllRoutines = function() {
  saveRoutinesToFile();
  bootstrap.Modal.getInstance(document.getElementById('manageRoutinesModal')).hide();
  loadDateData();
  showNotification('All changes saved!');
};

function saveRoutinesToFile() {
  // Save to localStorage (in a real app, this would save to a file)
  localStorage.setItem('routinesData', JSON.stringify(routinesData));
}

function loadRoutinesFromStorage() {
  const saved = localStorage.getItem('routinesData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.daily && parsed.daily.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error loading routines from storage:', e);
    }
  }
  return null;
}

window.selectWeekdays = function() {
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = true;
  });
  ['saturday', 'sunday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = false;
  });
};

window.selectWeekends = function() {
  ['saturday', 'sunday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = true;
  });
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = false;
  });
};

window.selectAllDays = function() {
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
    document.getElementById(`day-${day}`).checked = true;
  });
};

// Auto-mark missed routines checker
function startAutoMissedChecker() {
  // Check every minute if routines should be auto-marked as missed
  setInterval(() => {
    autoMarkMissedRoutines();
  }, 60000); // Run every 60 seconds
  
  // Also run immediately
  autoMarkMissedRoutines();
}

function autoMarkMissedRoutines() {
  // Only auto-mark for today
  const today = new Date();
  const todayKey = getDateKey(today);
  
  // Only check if we're viewing today
  if (getDateKey(currentDate) !== todayKey) {
    return;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  const dayName = dayNames[today.getDay()];
  const todayRoutines = getRoutinesForDay(dayName);
  
  if (!todayRoutines || todayRoutines.length === 0) {
    return;
  }
  
  const savedData = getSavedData(todayKey);
  savedData.daily = savedData.daily || {};
  
  let changed = false;
  
  // Sort routines by time to check them in order
  const sortedRoutines = [...todayRoutines].sort((a, b) => {
    const timeA = a.defaultTime || "00:00";
    const timeB = b.defaultTime || "00:00";
    return timeA.localeCompare(timeB);
  });
  
  for (let i = 0; i < sortedRoutines.length; i++) {
    const routine = sortedRoutines[i];
    const routineId = `${routine.name}-${routine.defaultTime}`;
    const routineTime = routine.defaultTime || "00:00";
    const [routineHour, routineMinute] = routineTime.split(':').map(Number);
    const routineTimeInMinutes = routineHour * 60 + routineMinute;
    
    // Check if the next routine has started
    const nextRoutine = sortedRoutines[i + 1];
    if (nextRoutine) {
      const nextRoutineTime = nextRoutine.defaultTime || "00:00";
      const [nextHour, nextMinute] = nextRoutineTime.split(':').map(Number);
      const nextRoutineTimeInMinutes = nextHour * 60 + nextMinute;
      
      // If current time is past the routine time and the next routine has started
      if (currentTimeInMinutes >= nextRoutineTimeInMinutes && currentTimeInMinutes > routineTimeInMinutes) {
        const savedRoutine = savedData.daily[routineId];
        
        // Only auto-mark if not already marked (not completed, not missed, not marked as "none")
        if (!savedRoutine || savedRoutine.status === 'none' || !savedRoutine.status) {
          savedData.daily[routineId] = {
            completed: false,
            timeSpent: 0,
            status: 'missed'
          };
          changed = true;
          console.log(`⏱️ Auto-marked as missed: ${routine.name} (${routineTime})`);
        }
      }
    } else {
      // For the last routine of the day, mark as missed if it's more than 30 minutes past its time
      if (currentTimeInMinutes > routineTimeInMinutes + 30) {
        const savedRoutine = savedData.daily[routineId];
        
        if (!savedRoutine || savedRoutine.status === 'none' || !savedRoutine.status) {
          savedData.daily[routineId] = {
            completed: false,
            timeSpent: 0,
            status: 'missed'
          };
          changed = true;
          console.log(`⏱️ Auto-marked as missed (last routine): ${routine.name} (${routineTime})`);
        }
      }
    }
  }
  
  // If any routines were auto-marked, save and reload
  if (changed) {
    saveData(todayKey, savedData);
    loadDateData();
  }
}

// Reload routines function
window.reloadRoutines = function() {
  console.log('🔄 Manually reloading routines...');
  // Clear localStorage routines to force reload from file
  localStorage.removeItem('routinesData');
  routinesData = { daily: [], weekly: [] };
  loadRoutines();
  showNotification('Reloading routines from file...');
};

// Export data
document.getElementById('exportBtn').onclick = () => {
  const allData = localStorage.getItem('routineTracker');
  const blob = new Blob([allData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `routine-tracker-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Data exported successfully!');
};
