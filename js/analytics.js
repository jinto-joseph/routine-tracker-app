let dailyChart, weeklyChart, taskChart, improvementChart, monthlyChart, pomodoroChart, progressChart, wellnessChart;
let routinesData = { daily: [], weekly: [] };
const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadRoutines();
  initializeDateInputs();
  updateCharts();
});

function loadRoutines() {
  // Try localStorage first
  const saved = JSON.parse(localStorage.getItem('routinesData') || '{}');
  if (saved && saved.daily && saved.daily.length > 0) {
    routinesData = saved;
    updateCharts();
  }
  
  // Then try file
  fetch("../data/routines.json")
    .then(res => res.json())
    .then(data => {
      routinesData = data;
      localStorage.setItem('routinesData', JSON.stringify(data));
      updateCharts();
    })
    .catch(err => {
      console.warn("Could not load routines from file:", err);
      // Use embedded if available
      if (typeof embeddedRoutinesData !== 'undefined') {
        routinesData = embeddedRoutinesData;
        updateCharts();
      }
    });
}

function getRoutinesForDay(dayName) {
  const dayLower = dayName.toLowerCase();
  const filtered = routinesData.daily.filter(routine => 
    routine.days && routine.days.includes(dayLower)
  );
  
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

function initializeDateInputs() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];
  document.getElementById('toDate').value = today.toISOString().split('T')[0];
}

function updateCharts() {
  const fromDate = new Date(document.getElementById('fromDate').value);
  const toDate = new Date(document.getElementById('toDate').value);
  
  const data = getDataForRange(fromDate, toDate);
  updateSummary(data);
  updateDailyProgressChart(data);
  updateWeeklyChart(data);
  updateTaskChart(data);
  updateImprovementChart(data);
  updateMonthlyChart(data);
  updatePomodoroChart();
  updateProgressChart(data);
  updateWellnessChart();
}

function getDataForRange(fromDate, toDate) {
  const allData = JSON.parse(localStorage.getItem('routineTracker') || '{}');
  const result = [];
  
  // Ensure routines are loaded
  if (!routinesData || !routinesData.daily || routinesData.daily.length === 0) {
    console.warn('⚠ Analytics: Routines not loaded, loading from localStorage...');
    const saved = JSON.parse(localStorage.getItem('routinesData') || '{}');
    if (saved && saved.daily) {
      routinesData = saved;
    }
  }
  
  const current = new Date(fromDate);
  while (current <= toDate) {
    const dateKey = getDateKey(current);
    const dayData = allData[dateKey];
    const dayName = dayNames[current.getDay()];
    const dayRoutines = getRoutinesForDay(dayName);
    
    if (dayData && dayData.daily && dayRoutines.length > 0) {
      let completedCount = 0;
      let totalGoal = 0;
      let totalTimeSpent = 0;
      const taskCompletion = {};
      
      let missedCount = 0;
      
      dayRoutines.forEach(routine => {
        const routineId = `${routine.name}-${routine.defaultTime}`;
        const savedRoutine = dayData.daily[routineId];
        
        // Track individual task completion
        if (!taskCompletion[routine.name]) {
          taskCompletion[routine.name] = { completed: 0, total: 0, timeSpent: 0, goal: 0 };
        }
        taskCompletion[routine.name].total++;
        taskCompletion[routine.name].goal += routine.goal || 0;
        
        if (savedRoutine) {
          // Check status (completed, missed, or none)
          const status = savedRoutine.status || (savedRoutine.completed ? 'completed' : 'none');
          if (status === 'completed') {
            completedCount++;
            taskCompletion[routine.name].completed++;
          } else if (status === 'missed') {
            missedCount++;
          }
          
          if (routine.goal > 0) {
            totalGoal += routine.goal;
            totalTimeSpent += savedRoutine.timeSpent || 0;
            taskCompletion[routine.name].timeSpent += savedRoutine.timeSpent || 0;
          }
        }
      });
      
      // Calculate progress with penalty for missed routines
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
      
      const weeklyTasks = Object.values(dayData.weekly || {});
      const weeklyCompleted = weeklyTasks.filter(v => v).length;
      const weeklyTotal = routinesData.weekly ? routinesData.weekly.length : 0;
      const weeklyPercent = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
      
      result.push({
        date: new Date(current),
        dateKey: dateKey,
        dailyProgress: dailyPercent,
        weeklyProgress: weeklyPercent,
        dailyTasks: taskCompletion,
        weeklyTasks: weeklyTasks,
        timeSpent: totalTimeSpent,
        goal: totalGoal
      });
    } else {
      // Even if no data, calculate potential progress based on routines
      let potentialProgress = 0;
      if (dayRoutines.length > 0) {
        const totalGoal = dayRoutines.reduce((sum, r) => sum + (r.goal || 0), 0);
        potentialProgress = totalGoal > 0 ? 0 : 0; // No progress if nothing completed
      }
      
      result.push({
        date: new Date(current),
        dateKey: dateKey,
        dailyProgress: potentialProgress,
        weeklyProgress: 0,
        dailyTasks: {},
        weeklyTasks: [],
        timeSpent: 0,
        goal: dayRoutines.reduce((sum, r) => sum + (r.goal || 0), 0)
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return result;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function updateSummary(data) {
  if (data.length === 0) return;
  
  // Average daily progress
  const avgProgress = Math.round(data.reduce((sum, d) => sum + d.dailyProgress, 0) / data.length);
  document.getElementById('avgDailyProgress').textContent = avgProgress + '%';
  
  // Current streak
  const streak = calculateStreak();
  document.getElementById('currentStreak').textContent = streak;
  
  // Total days tracked
  const trackedDays = data.filter(d => d.dailyProgress > 0 || d.weeklyProgress > 0).length;
  document.getElementById('totalDays').textContent = trackedDays;
  
  // Best day
  const bestDay = Math.max(...data.map(d => d.dailyProgress));
  document.getElementById('bestDay').textContent = bestDay + '%';
}

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
      
      if (completedCount >= dayRoutines.length * 0.5) {
        streak++;
      } else {
        break;
      }
    } else if (dayRoutines.length === 0) {
      // No routines for this day, skip it
      continue;
    } else {
      break;
    }
  }
  
  return streak;
}

function updateDailyProgressChart(data) {
  const ctx = document.getElementById('dailyProgressChart');
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#212529';
  const gridColor = isDark ? '#333' : '#e0e0e0';
  
  if (dailyChart) {
    dailyChart.destroy();
  }
  
  dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Daily Progress %',
        data: data.map(d => d.dailyProgress),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Weekly Progress %',
        data: data.map(d => d.weeklyProgress),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function updateWeeklyChart(data) {
  const ctx = document.getElementById('weeklyChart');
  
  // Group by week
  const weeklyData = {};
  data.forEach(d => {
    const weekStart = getWeekStart(d.date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { progress: [], count: 0 };
    }
    weeklyData[weekKey].progress.push(d.dailyProgress);
    weeklyData[weekKey].count++;
  });
  
  const weeks = Object.keys(weeklyData).sort();
  const avgProgress = weeks.map(w => {
    const week = weeklyData[w];
    return Math.round(week.progress.reduce((a, b) => a + b, 0) / week.progress.length);
  });
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#212529';
  const gridColor = isDark ? '#333' : '#e0e0e0';
  
  if (weeklyChart) {
    weeklyChart.destroy();
  }
  
  weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeks.map(w => new Date(w).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Average Weekly Progress %',
        data: avgProgress,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function updateTaskChart(data) {
  const ctx = document.getElementById('taskChart');
  
  // Calculate completion rate for each task
  const taskStats = {};
  
  // Collect all unique task names
  const allTasks = new Set();
  routinesData.daily.forEach(routine => {
    allTasks.add(routine.name);
  });
  
  allTasks.forEach(taskName => {
    let completed = 0;
    let total = 0;
    let totalTimeSpent = 0;
    let totalGoal = 0;
    
    data.forEach(d => {
      if (d.dailyTasks[taskName]) {
        total += d.dailyTasks[taskName].total;
        completed += d.dailyTasks[taskName].completed;
        totalTimeSpent += d.dailyTasks[taskName].timeSpent;
        totalGoal += d.dailyTasks[taskName].goal;
      }
    });
    
    // Calculate completion rate (combination of completion and goal achievement)
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const goalRate = totalGoal > 0 ? Math.round((totalTimeSpent / totalGoal) * 100) : 0;
    const overallRate = Math.round((completionRate + goalRate) / 2);
    
    taskStats[taskName] = overallRate;
  });
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#212529';
  
  if (taskChart) {
    taskChart.destroy();
  }
  
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(255, 99, 255, 0.8)',
    'rgba(99, 255, 132, 0.8)'
  ];
  
  taskChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(taskStats),
      datasets: [{
        data: Object.values(taskStats),
        backgroundColor: colors.slice(0, Object.keys(taskStats).length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor }
        }
      }
    }
  });
}

function updateImprovementChart(data) {
  const ctx = document.getElementById('improvementChart');
  
  // Calculate 7-day moving average
  const movingAvg = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - 6);
    const slice = data.slice(start, i + 1);
    const avg = Math.round(slice.reduce((sum, d) => sum + d.dailyProgress, 0) / slice.length);
    movingAvg.push(avg);
  }
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#212529';
  const gridColor = isDark ? '#333' : '#e0e0e0';
  
  if (improvementChart) {
    improvementChart.destroy();
  }
  
  improvementChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Daily Progress',
        data: data.map(d => d.dailyProgress),
        borderColor: 'rgba(200, 200, 200, 0.5)',
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        tension: 0.4
      }, {
        label: '7-Day Moving Average',
        data: movingAvg,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        borderWidth: 3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function updateMonthlyChart(data) {
  const ctx = document.getElementById('monthlyChart');
  
  // Group by month
  const monthlyData = {};
  data.forEach(d => {
    const monthKey = d.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { progress: [], count: 0 };
    }
    monthlyData[monthKey].progress.push(d.dailyProgress);
    monthlyData[monthKey].count++;
  });
  
  const months = Object.keys(monthlyData).sort();
  const avgProgress = months.map(m => {
    const month = monthlyData[m];
    return Math.round(month.progress.reduce((a, b) => a + b, 0) / month.progress.length);
  });
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#212529';
  const gridColor = isDark ? '#333' : '#e0e0e0';
  
  if (monthlyChart) {
    monthlyChart.destroy();
  }
  
  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Average Monthly Progress %',
        data: avgProgress,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

// Pomodoro Time Utilization Chart
function updatePomodoroChart() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Get pomodoro history from localStorage
  const history = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  const categoryTimes = {};
  
  // Calculate time spent per category (each pomodoro = 25 minutes)
  Object.keys(history).forEach(date => {
    history[date].forEach(session => {
      if (session.type === 'pomodoro') {
        const category = session.category || 'Other';
        categoryTimes[category] = (categoryTimes[category] || 0) + 25;
      }
    });
  });
  
  const categories = Object.keys(categoryTimes);
  const times = Object.values(categoryTimes);
  
  if (pomodoroChart) pomodoroChart.destroy();
  
  const ctx = document.getElementById('pomodoroChart').getContext('2d');
  pomodoroChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.length > 0 ? categories : ['No Data'],
      datasets: [{
        label: 'Minutes Spent',
        data: times.length > 0 ? times : [1],
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',  // Career - Blue
          'rgba(76, 175, 80, 0.8)',   // Improvement - Green
          'rgba(255, 193, 7, 0.8)',   // Personal - Yellow
          'rgba(156, 39, 176, 0.8)',  // Study - Purple
          'rgba(255, 87, 34, 0.8)',   // Health - Orange
          'rgba(96, 125, 139, 0.8)'   // Other - Gray
        ],
        borderColor: isDark ? '#1a1a1a' : '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const hours = Math.floor(value / 60);
              const mins = value % 60;
              return `${label}: ${hours}h ${mins}m`;
            }
          }
        }
      }
    }
  });
}

// Progress Chart - Shows routine completion trend
function updateProgressChart(data) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Get last 7 days of data
  const last7Days = data.slice(-7);
  const labels = last7Days.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });
  const progressData = last7Days.map(d => d.completionPercent);
  
  if (progressChart) progressChart.destroy();
  
  const ctx = document.getElementById('progressChart').getContext('2d');
  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{
        label: 'Daily Progress %',
        data: progressData.length > 0 ? progressData : [0],
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

// Wellness Chart - Tracks health-related routines
function updateWellnessChart() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Get last 7 days
  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date);
  }
  
  const allData = JSON.parse(localStorage.getItem('routineTracker') || '{}');
  const wellnessMetrics = {
    exercise: 0,
    sleep: 0,
    meditation: 0,
    hydration: 0
  };
  
  // Track wellness-related routines for the week
  last7Days.forEach(date => {
    const dateKey = getDateKey(date);
    const dayData = allData[dateKey];
    const dayName = dayNames[date.getDay()];
    const dayRoutines = getRoutinesForDay(dayName);
    
    if (dayData && dayData.daily && dayRoutines.length > 0) {
      dayRoutines.forEach(routine => {
        const routineId = `${routine.name}-${routine.defaultTime}`;
        const savedRoutine = dayData.daily[routineId];
        
        if (savedRoutine && savedRoutine.status === 'completed') {
          const name = routine.name.toLowerCase();
          
          // Exercise and Meditation tracked from SAVERS completion
          if (name.includes('savers')) {
            wellnessMetrics.exercise++;
            wellnessMetrics.meditation++;
          }
          
          // Sleep tracked from Wake up completion - calculate sleep hours
          if (name.includes('wake up')) {
            // Get wake up time from routine
            const wakeTime = routine.defaultTime; // e.g., "05:45"
            if (wakeTime) {
              const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
              // Assuming 8 hours of sleep (bedtime would be 8 hours before wake up)
              // If wake up at 5:45, bedtime was 21:45 (9:45 PM)
              // You can customize this calculation or add a bedtime routine
              const sleepHours = 8; // Default assumption
              wellnessMetrics.sleep += sleepHours;
            }
          }
          
          // Hydration tracked from water/drink routines
          if (name.includes('water') || name.includes('hydrat') || name.includes('drink')) {
            wellnessMetrics.hydration++;
          }
        }
      });
    }
  });
  
  if (wellnessChart) wellnessChart.destroy();
  
  const ctx = document.getElementById('wellnessChart').getContext('2d');
  wellnessChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Exercise (SAVERS)', 'Sleep (Hours)', 'Meditation (SAVERS)', 'Hydration (Glasses)'],
      datasets: [{
        label: 'This Week',
        data: [
          wellnessMetrics.exercise,
          wellnessMetrics.sleep,
          wellnessMetrics.meditation,
          wellnessMetrics.hydration
        ],
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(76, 175, 80, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed.r || 0;
              if (label.includes('Sleep')) {
                return `${label}: ${value} hours`;
              } else if (label.includes('Hydration')) {
                return `${label}: ${value} glasses`;
              } else {
                return `${label}: ${value} times`;
              }
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: { 
            color: textColor,
            backdropColor: 'transparent',
            stepSize: 1
          },
          grid: { color: gridColor },
          pointLabels: { 
            color: textColor,
            font: { size: 11 }
          }
        }
      }
    }
  });
}

// Make updateCharts available globally
window.updateCharts = updateCharts;
