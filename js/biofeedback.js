// ============================================================
// HabitFlow — Biofeedback Intelligence & Predictive Health
// ============================================================

const BIO_MAPPINGS = {
  // keyword → biological systems affected
  sleep: {
    icon: '🌙',
    systems: ['Circadian Rhythm', 'Melatonin Regulation', 'Cortisol Balance', 'Memory Consolidation'],
    bioMarkers: ['Melatonin secretion', 'Adenosine clearance', 'Growth hormone pulse', 'Synaptic pruning'],
    color: '#6c63ff',
    gradient: 'linear-gradient(135deg, #6c63ff, #3f3d8f)',
    insight: 'Sleep drives glymphatic waste clearance and long-term potentiation for memory.'
  },
  wake: {
    icon: '☀️',
    systems: ['Cortisol Awakening Response', 'Circadian Phase', 'Serotonin Pathway'],
    bioMarkers: ['Cortisol peak (30–45 min post-wake)', 'Core body temperature rise', 'Serotonin → dopamine shift'],
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    insight: 'Consistent wake times anchor your circadian phase and cortisol awakening response.'
  },
  exercise: {
    icon: '🏋️',
    systems: ['Mitochondrial Biogenesis', 'ATP Metabolism', 'VO₂ Capacity', 'BDNF Synthesis'],
    bioMarkers: ['PGC-1α activation', 'Lactate threshold', 'IL-6 myokine release', 'BDNF upregulation'],
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    insight: 'Exercise triggers PGC-1α, increasing mitochondrial density and metabolic efficiency.'
  },
  walk: {
    icon: '🚶',
    systems: ['Lymphatic Circulation', 'Insulin Sensitivity', 'Dopamine Pathway'],
    bioMarkers: ['Postprandial glucose clearance', 'GLUT-4 translocation', 'Endocannabinoid release'],
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    insight: 'Walking post-meals activates GLUT-4 transporters, reducing insulin demand by up to 30%.'
  },
  meditation: {
    icon: '🧘',
    systems: ['HRV Regulation', 'Amygdala Modulation', 'Cortisol Reduction', 'Neuroplasticity'],
    bioMarkers: ['Parasympathetic tone (HRV)', 'Default Mode Network activity', 'Cortisol suppression', 'Gray matter density'],
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    insight: 'Consistent meditation thickens prefrontal cortex gray matter and reduces amygdala reactivity.'
  },
  read: {
    icon: '📚',
    systems: ['Cognitive Reserve', 'Neural Network Density', 'Synaptic Plasticity'],
    bioMarkers: ['BDNF expression', 'Dendritic arborization', 'Working memory capacity'],
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    insight: 'Reading builds cognitive reserve, delaying neurodegeneration by increasing synaptic redundancy.'
  },
  journal: {
    icon: '✍️',
    systems: ['Prefrontal-Limbic Regulation', 'Cortisol Processing', 'Emotional Homeostasis'],
    bioMarkers: ['IL-6 inflammatory marker reduction', 'Prefrontal activation', 'Vagal tone improvement'],
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
    insight: 'Expressive writing reduces inflammatory markers and strengthens prefrontal regulation of the limbic system.'
  },
  water: {
    icon: '💧',
    systems: ['Cellular Osmolarity', 'Renal Function', 'Glucose Homeostasis', 'Lymphatic Flow'],
    bioMarkers: ['Plasma osmolality', 'ADH (vasopressin) suppression', 'Glomerular filtration rate'],
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    insight: 'Optimal hydration maintains plasma osmolality at 280–295 mOsm/kg, critical for enzyme function.'
  },
  diet: {
    icon: '🥗',
    systems: ['Gut Microbiome', 'Glucose Homeostasis', 'Insulin Signalling', 'Inflammation Cascade'],
    bioMarkers: ['Short-chain fatty acids', 'Postprandial glucose', 'Insulin sensitivity index', 'CRP levels'],
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    insight: 'Meal timing consistency stabilises the gut-brain axis clock genes (CLOCK, BMAL1) and reduces metabolic variability.'
  },
  savers: {
    icon: '⭐',
    systems: ['Neuroendocrine Axis', 'Circadian Entrainment', 'HPA Axis Regulation'],
    bioMarkers: ['Morning cortisol slope', 'Serotonin synthesis', 'Parasympathetic baseline'],
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    insight: 'A consistent SAVERS morning routine entrains the HPA axis, producing a healthier cortisol awakening response.'
  },
  study: {
    icon: '📖',
    systems: ['Long-Term Potentiation', 'Dopaminergic Reward', 'Working Memory'],
    bioMarkers: ['AMPA receptor upregulation', 'D1 receptor activation', 'Acetylcholine release'],
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    insight: 'Spaced study sessions trigger long-term potentiation, consolidating memories via AMPA receptor upregulation.'
  }
};

// ── Utility ──────────────────────────────────────────────────
function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

// ── Data Aggregation ─────────────────────────────────────────
function aggregateHabitData() {
  const tracker = JSON.parse(localStorage.getItem('routineTracker') || '{}');
  const wellness = JSON.parse(localStorage.getItem('wellnessData') || '{}');
  const pomodoroHistory = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  const routinesData = JSON.parse(localStorage.getItem('routinesData') || '{"daily":[]}');

  const days = getLast30Days();
  const summary = {
    totalDays: days.length,
    daysWithData: 0,
    avgCompletion: 0,
    completionByDay: [],
    habitFrequency: {},     // habit name → completion count
    sleepData: [],          // [{date, hours}]
    waterData: [],          // [{date, glasses}]
    pomodoroByCategory: {}, // category → total minutes
    consistencyScore: 0,
    streakLength: 0,
    weeklyTrend: [],        // last 4 week averages
    categoryCounts: {},
    topHabits: [],
    lowHabits: []
  };

  let totalCompletion = 0;

  days.forEach(date => {
    const dk = getDateKey(date);
    const dayData = tracker[dk];
    const wellnessDay = wellness[dk] || {};

    // Wellness
    if (wellnessDay.sleepHours > 0) {
      summary.sleepData.push({ date: dk, hours: wellnessDay.sleepHours });
    }
    if (wellnessDay.waterIntake > 0) {
      summary.waterData.push({ date: dk, glasses: wellnessDay.waterIntake });
    }

    if (!dayData || !dayData.daily) {
      summary.completionByDay.push({ date: dk, pct: 0 });
      return;
    }

    summary.daysWithData++;
    const statuses = Object.values(dayData.daily);
    const completed = statuses.filter(s => s.status === 'completed' || s.completed).length;
    const total = statuses.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    summary.completionByDay.push({ date: dk, pct });
    totalCompletion += pct;

    // Habit frequency
    Object.entries(dayData.daily).forEach(([id, val]) => {
      const name = id.split('-').slice(0, -1).join(' ').toLowerCase();
      if (val.status === 'completed' || val.completed) {
        summary.habitFrequency[name] = (summary.habitFrequency[name] || 0) + 1;
      }
    });
  });

  // Pomodoro
  Object.values(pomodoroHistory).forEach(sessions => {
    sessions.forEach(s => {
      if (s.type === 'pomodoro') {
        const cat = s.category || 'Other';
        summary.pomodoroByCategory[cat] = (summary.pomodoroByCategory[cat] || 0) + 25;
      }
    });
  });

  // Averages
  summary.avgCompletion = summary.daysWithData > 0
    ? Math.round(totalCompletion / summary.daysWithData)
    : 0;

  // Weekly trend (4 weeks)
  for (let w = 0; w < 4; w++) {
    const slice = summary.completionByDay.slice(w * 7, (w + 1) * 7);
    const avg = slice.length > 0
      ? Math.round(slice.reduce((a, b) => a + b.pct, 0) / slice.length)
      : 0;
    summary.weeklyTrend.push(avg);
  }

  // Top/low habits
  const freq = Object.entries(summary.habitFrequency).sort((a, b) => b[1] - a[1]);
  summary.topHabits = freq.slice(0, 3).map(([name, count]) => ({ name, count, pct: Math.round((count / 30) * 100) }));
  summary.lowHabits = freq.filter(([, c]) => c < 10).slice(0, 3).map(([name, count]) => ({ name, count, pct: Math.round((count / 30) * 100) }));

  // Consistency score: % of days where completion > 50%
  const goodDays = summary.completionByDay.filter(d => d.pct >= 50).length;
  summary.consistencyScore = Math.round((goodDays / 30) * 100);

  // Streak
  const allTracker = JSON.parse(localStorage.getItem('routineTracker') || '{}');
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const cd = new Date(today);
    cd.setDate(today.getDate() - i);
    const dk = getDateKey(cd);
    const dd = allTracker[dk];
    if (dd && dd.daily) {
      const vals = Object.values(dd.daily);
      const comp = vals.filter(v => v.status === 'completed' || v.completed).length;
      if (comp >= vals.length * 0.5) { streak++; } else { break; }
    } else if (i > 0) { break; }
  }
  summary.streakLength = streak;

  return summary;
}

// ── Biological Match ─────────────────────────────────────────
function matchBioSystems(habitFrequency) {
  const matched = {};
  Object.entries(habitFrequency).forEach(([habitName]) => {
    Object.entries(BIO_MAPPINGS).forEach(([keyword, mapping]) => {
      if (habitName.includes(keyword)) {
        if (!matched[keyword]) matched[keyword] = { ...mapping, habitName, keyword };
      }
    });
  });

  // Always include sleep/water from wellness if tracked
  const wellness = JSON.parse(localStorage.getItem('wellnessData') || '{}');
  const hasWellness = Object.values(wellness).some(d => d.sleepHours > 0 || d.waterIntake > 0);
  if (hasWellness) {
    if (!matched.sleep) matched.sleep = { ...BIO_MAPPINGS.sleep, habitName: 'Sleep Tracking', keyword: 'sleep' };
    if (!matched.water) matched.water = { ...BIO_MAPPINGS.water, habitName: 'Hydration Tracking', keyword: 'water' };
  }

  return Object.values(matched);
}

// ── Linear Regression ────────────────────────────────────────
function linearRegression(yValues) {
  const n = yValues.length;
  if (n < 3) return { slope: 0, next7: [] };

  const xValues = yValues.map((_, i) => i);
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  let num = 0, den = 0;
  xValues.forEach((x, i) => {
    num += (x - xMean) * (yValues[i] - yMean);
    den += (x - xMean) ** 2;
  });

  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  const next7 = [];
  for (let i = 1; i <= 7; i++) {
    const predicted = intercept + slope * (n - 1 + i);
    next7.push(Math.min(100, Math.max(0, Math.round(predicted))));
  }

  return { slope: Math.round(slope * 100) / 100, intercept, next7 };
}

function buildTrajectoryInsights(data) {
  const completionValues = data.completionByDay.map(d => d.pct);
  const regression = linearRegression(completionValues);

  const avgSleep = data.sleepData.length > 0
    ? (data.sleepData.reduce((a, b) => a + b.hours, 0) / data.sleepData.length).toFixed(1)
    : null;

  const avgWater = data.waterData.length > 0
    ? (data.waterData.reduce((a, b) => a + b.glasses, 0) / data.waterData.length).toFixed(1)
    : null;

  // Cognitive performance trend
  const studyMinutes = (data.pomodoroByCategory['Study'] || 0) + (data.pomodoroByCategory['Career'] || 0);
  const cognitiveScore = Math.min(100, Math.round((studyMinutes / 600) * 100)); // 600 min = 100%

  // Energy stability
  const sleepConsistency = data.sleepData.length >= 3
    ? (() => {
        const hrs = data.sleepData.map(d => d.hours);
        const mean = hrs.reduce((a, b) => a + b, 0) / hrs.length;
        const variance = hrs.reduce((a, b) => a + (b - mean) ** 2, 0) / hrs.length;
        return Math.round((1 - Math.min(1, variance / 4)) * 100);
      })()
    : null;

  let trajectoryLabel, trajectoryColor, trajectoryIcon;
  if (regression.slope > 1) {
    trajectoryLabel = 'Strongly Improving';
    trajectoryColor = '#10b981';
    trajectoryIcon = '📈';
  } else if (regression.slope > 0) {
    trajectoryLabel = 'Gradually Improving';
    trajectoryColor = '#3b82f6';
    trajectoryIcon = '↗️';
  } else if (regression.slope > -1) {
    trajectoryLabel = 'Stable';
    trajectoryColor = '#f59e0b';
    trajectoryIcon = '➡️';
  } else {
    trajectoryLabel = 'Declining – Attention Needed';
    trajectoryColor = '#ef4444';
    trajectoryIcon = '📉';
  }

  return {
    regression,
    trajectoryLabel,
    trajectoryColor,
    trajectoryIcon,
    avgSleep,
    avgWater,
    cognitiveScore,
    sleepConsistency,
    projectedEnergy: regression.next7.length > 0
      ? (regression.next7.reduce((a, b) => a + b, 0) / regression.next7.length).toFixed(0)
      : data.avgCompletion
  };
}

// ── AI Analysis via Anthropic API ────────────────────────────
async function runAIAnalysis(data, trajectory) {
  const prompt = buildAnalysisPrompt(data, trajectory);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const result = await response.json();
  return result.content[0]?.text || '';
}

function buildAnalysisPrompt(data, trajectory) {
  const habitList = data.topHabits.map(h => `${h.name} (${h.pct}% consistency)`).join(', ');
  const weakList = data.lowHabits.map(h => `${h.name} (${h.pct}% consistency)`).join(', ');

  return `You are a precision health AI embedded in a habit-tracking app called HabitFlow. Analyze the following 30-day habit data and provide biofeedback-based health intelligence. Be specific, biological, and actionable. Use physiological terminology appropriately but explain it clearly.

USER'S 30-DAY HABIT DATA:
- Average daily completion: ${data.avgCompletion}%
- Consistency score (days ≥50% complete): ${data.consistencyScore}%
- Current streak: ${data.streakLength} days
- Weekly trend (oldest→newest): ${data.weeklyTrend.join('% → ')}%
- Most consistent habits: ${habitList || 'No data yet'}
- Habits needing improvement: ${weakList || 'None identified'}
- Average sleep: ${trajectory.avgSleep ? trajectory.avgSleep + ' hours/night' : 'Not tracked'}
- Average hydration: ${trajectory.avgWater ? trajectory.avgWater + ' glasses/day' : 'Not tracked'}
- Focus sessions (Pomodoro): ${JSON.stringify(data.pomodoroByCategory)}
- Completion trend slope: ${trajectory.regression.slope} (positive = improving)
- Projected completion next 7 days: ${trajectory.regression.next7.join(', ')}%

Respond in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "overallAssessment": "2–3 sentences about the user's overall biological health trajectory based on their habits",
  "sleepInsight": "1–2 sentences about what their sleep pattern (or lack of tracking) means for melatonin, cortisol, and circadian regulation. If not tracked, mention the importance.",
  "metabolicInsight": "1–2 sentences about what their hydration and exercise consistency means for glucose homeostasis, mitochondrial efficiency, or cellular osmolarity",
  "cognitiveInsight": "1–2 sentences about what their study/reading/focus habits mean for BDNF, neuroplasticity, and long-term potentiation",
  "topWarning": "1 specific biological risk from their data (e.g. inconsistent sleep disrupting melatonin efficiency, dehydration elevating plasma osmolality, etc.)",
  "topOpportunity": "1 specific biological benefit they could unlock by improving their lowest habit",
  "predictions": [
    { "metric": "Energy Stability", "trend": "improving|stable|declining", "reason": "one sentence" },
    { "metric": "Cognitive Performance", "trend": "improving|stable|declining", "reason": "one sentence" },
    { "metric": "Metabolic Efficiency", "trend": "improving|stable|declining", "reason": "one sentence" },
    { "metric": "Stress Resilience", "trend": "improving|stable|declining", "reason": "one sentence" }
  ],
  "actionItems": [
    "Specific, biologically-grounded action #1",
    "Specific, biologically-grounded action #2",
    "Specific, biologically-grounded action #3"
  ]
}`;
}

// ── Rendering ────────────────────────────────────────────────
function renderBioSystems(systems) {
  const container = document.getElementById('bioSystemsGrid');
  if (!container) return;

  if (systems.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-4 text-muted">
        <i class="bi bi-info-circle fs-3"></i>
        <p class="mt-2">No habits tracked yet. Start logging habits to see your biological impact map.</p>
      </div>`;
    return;
  }

  container.innerHTML = systems.map(sys => `
    <div class="col-md-6 col-lg-4 mb-3">
      <div class="bio-card h-100" style="border-top: 4px solid ${sys.color}">
        <div class="bio-card-header">
          <span class="bio-icon">${sys.icon}</span>
          <div>
            <div class="bio-habit-name">${sys.habitName || sys.keyword}</div>
            <div class="bio-systems-label">Biological Systems Affected</div>
          </div>
        </div>
        <div class="bio-systems-list">
          ${sys.systems.map(s => `<span class="bio-tag" style="background:${sys.color}22;color:${sys.color};border:1px solid ${sys.color}44">${s}</span>`).join('')}
        </div>
        <div class="bio-markers">
          <div class="bio-markers-title">Key Biomarkers</div>
          <ul class="bio-markers-list">
            ${sys.bioMarkers.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
        <div class="bio-insight">
          <i class="bi bi-lightbulb-fill" style="color:${sys.color}"></i>
          ${sys.insight}
        </div>
      </div>
    </div>
  `).join('');
}

function renderStats(data, trajectory) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('bf-avg-completion', data.avgCompletion + '%');
  set('bf-consistency', data.consistencyScore + '%');
  set('bf-streak', data.streakLength + ' days');
  set('bf-sleep', trajectory.avgSleep ? trajectory.avgSleep + ' hrs' : 'N/A');
  set('bf-energy-proj', trajectory.projectedEnergy + '%');
  set('bf-trend-label', trajectory.trajectoryIcon + ' ' + trajectory.trajectoryLabel);

  const trendEl = document.getElementById('bf-trend-label');
  if (trendEl) trendEl.style.color = trajectory.trajectoryColor;

  // Mini trend bars
  renderMiniTrend(data.completionByDay.map(d => d.pct));

  // Projected bars
  renderProjectedBars(trajectory.regression.next7, trajectory.trajectoryColor);
}

function renderMiniTrend(values) {
  const canvas = document.getElementById('trendCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const max = 100;
  const barW = w / values.length - 2;

  values.forEach((v, i) => {
    const barH = (v / max) * (h - 10);
    const x = i * (barW + 2);
    const y = h - barH;
    const alpha = 0.3 + (i / values.length) * 0.7;
    ctx.fillStyle = `rgba(33, 150, 243, ${alpha})`;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 2);
    ctx.fill();
  });
}

function renderProjectedBars(next7, color) {
  const container = document.getElementById('projectedBars');
  if (!container) return;

  const days = ['D+1', 'D+2', 'D+3', 'D+4', 'D+5', 'D+6', 'D+7'];
  container.innerHTML = next7.map((v, i) => `
    <div class="proj-bar-wrap">
      <div class="proj-bar-label">${days[i]}</div>
      <div class="proj-bar-track">
        <div class="proj-bar-fill" style="width:${v}%;background:${color}"></div>
      </div>
      <div class="proj-bar-value">${v}%</div>
    </div>
  `).join('');
}

function renderAIInsights(parsed) {
  const el = id => document.getElementById(id);

  // Overall
  if (el('ai-overall')) el('ai-overall').textContent = parsed.overallAssessment;

  // Insights
  const insights = [
    { id: 'ai-sleep', icon: '🌙', title: 'Sleep & Circadian Biology', text: parsed.sleepInsight },
    { id: 'ai-metabolic', icon: '⚡', title: 'Metabolic & Cellular Health', text: parsed.metabolicInsight },
    { id: 'ai-cognitive', icon: '🧠', title: 'Cognitive & Neural Health', text: parsed.cognitiveInsight }
  ];

  insights.forEach(({ id, icon, title, text }) => {
    const container = el(id);
    if (container && text) {
      container.innerHTML = `
        <div class="ai-insight-card">
          <div class="ai-insight-header"><span>${icon}</span><strong>${title}</strong></div>
          <p class="ai-insight-text">${text}</p>
        </div>`;
    }
  });

  // Warning / Opportunity
  if (el('ai-warning') && parsed.topWarning) {
    el('ai-warning').innerHTML = `
      <div class="bio-alert bio-alert-warning">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Biological Risk:</strong> ${parsed.topWarning}
      </div>`;
  }
  if (el('ai-opportunity') && parsed.topOpportunity) {
    el('ai-opportunity').innerHTML = `
      <div class="bio-alert bio-alert-success">
        <i class="bi bi-star-fill me-2"></i>
        <strong>Unlock Potential:</strong> ${parsed.topOpportunity}
      </div>`;
  }

  // Predictions
  if (el('ai-predictions') && parsed.predictions) {
    const trendIcon = t => t === 'improving' ? '📈' : t === 'stable' ? '➡️' : '📉';
    const trendColor = t => t === 'improving' ? '#10b981' : t === 'stable' ? '#f59e0b' : '#ef4444';
    el('ai-predictions').innerHTML = parsed.predictions.map(p => `
      <div class="prediction-row">
        <div class="prediction-metric">${p.metric}</div>
        <div class="prediction-trend" style="color:${trendColor(p.trend)}">${trendIcon(p.trend)} ${p.trend}</div>
        <div class="prediction-reason">${p.reason}</div>
      </div>
    `).join('');
  }

  // Action items
  if (el('ai-actions') && parsed.actionItems) {
    el('ai-actions').innerHTML = parsed.actionItems.map((item, i) => `
      <div class="action-item">
        <div class="action-num">${i + 1}</div>
        <div class="action-text">${item}</div>
      </div>
    `).join('');
  }
}

// ── Main Init ────────────────────────────────────────────────
async function initBiofeedback() {
  const data = aggregateHabitData();
  const trajectory = buildTrajectoryInsights(data);
  const bioSystems = matchBioSystems(data.habitFrequency);

  renderStats(data, trajectory);
  renderBioSystems(bioSystems);

  // AI Analysis
  const aiBtn = document.getElementById('runAIBtn');
  const aiPanel = document.getElementById('aiPanel');
  const aiLoading = document.getElementById('aiLoading');
  const aiError = document.getElementById('aiError');
  const aiContent = document.getElementById('aiContent');

  if (aiBtn) {
    aiBtn.addEventListener('click', async () => {
      aiPanel.classList.remove('d-none');
      aiLoading.classList.remove('d-none');
      aiContent.classList.add('d-none');
      aiError.classList.add('d-none');
      aiBtn.disabled = true;
      aiBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Analysing...';

      try {
        const rawText = await runAIAnalysis(data, trajectory);
        const parsed = JSON.parse(rawText);
        renderAIInsights(parsed);
        aiContent.classList.remove('d-none');
      } catch (err) {
        console.error('AI Analysis error:', err);
        aiError.classList.remove('d-none');
        aiError.textContent = 'Analysis failed: ' + err.message + '. Please try again.';
      } finally {
        aiLoading.classList.add('d-none');
        aiBtn.disabled = false;
        aiBtn.innerHTML = '<i class="bi bi-cpu me-2"></i>Re-run AI Analysis';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initBiofeedback);
