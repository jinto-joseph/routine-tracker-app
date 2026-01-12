/**
 * HabitFlow Onboarding Tour
 * Interactive guided tour for first-time users
 */

class OnboardingTour {
  constructor() {
    this.tourCompleted = localStorage.getItem('habitflow_tour_completed') === 'true';
    this.currentStep = 0;
    this.steps = [];
    this.overlay = null;
    this.tooltip = null;
  }

  /**
   * Initialize and start the tour if it's the user's first visit
   */
  init() {
    // Check if tour should be shown
    if (this.tourCompleted) {
      console.log('✅ Tour already completed, skipping');
      return;
    }

    console.log('🎯 Initializing HabitFlow tour...');

    // Wait for DOM to be fully loaded and app to be initialized
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, starting tour in 2 seconds...');
        setTimeout(() => this.start(), 2000);
      });
    } else {
      // DOM is already loaded, wait a bit longer for app initialization
      console.log('📄 DOM already loaded, starting tour in 2 seconds...');
      setTimeout(() => this.start(), 2000);
    }
  }

  /**
   * Define tour steps
   */
  defineTourSteps() {
    this.steps = [
      {
        element: null,
        title: '👋 Welcome to HabitFlow!',
        content: 'Your personal habit tracking companion. Let\'s take a quick tour to get you started!',
        position: 'center'
      },
      {
        element: '#addRoutinesSidebar',
        title: '➕ Add Your First Routine',
        content: 'Start by clicking here to add your daily or weekly routines. You can set specific times, goals, and categories for each habit.',
        position: 'right',
        highlightClick: false
      },
      {
        element: '#editRoutinesSidebar',
        title: '✏️ Edit & Manage',
        content: 'Easily edit or remove your routines anytime. Your habits evolve, and so should your tracker!',
        position: 'right',
        highlightClick: false
      },
      {
        element: '#dailyRoutine',
        title: '📋 Daily Routines',
        content: 'Your daily habits appear here. Mark them as complete, missed, or in-progress throughout the day.',
        position: 'bottom',
        highlightClick: false
      },
      {
        element: '#weeklyRoutine',
        title: '📅 Weekly Routines',
        content: 'Track habits that happen on specific days of the week.',
        position: 'bottom',
        highlightClick: false
      },
      {
        element: '#progressBar',
        title: '📊 Track Your Progress',
        content: 'Watch your daily progress grow as you complete your routines!',
        position: 'bottom',
        highlightClick: false
      },
      {
        element: '#dailyProgressCard',
        title: '📈 Statistics at a Glance',
        content: 'See your completion rates, streaks, and overall progress instantly.',
        position: 'bottom',
        highlightClick: false
      },
      {
        element: '[href="analytics.html"]',
        title: '📊 Analytics Dashboard',
        content: 'View detailed charts, trends, and insights about your habits over time.',
        position: 'right',
        highlightClick: false
      },
      {
        element: '[href="pomodoro.html"]',
        title: '⏱️ Pomodoro Timer',
        content: 'Use the built-in Pomodoro timer to stay focused and track your study/work sessions.',
        position: 'right',
        highlightClick: false
      },
      {
        element: '#reminderBtnSidebar',
        title: '🔔 Set Reminders',
        content: 'Never miss a routine! Set custom reminders for each of your habits.',
        position: 'right',
        highlightClick: false
      },
      {
        element: '.sidebar-calendar',
        title: '📆 Mini Calendar',
        content: 'Navigate to any date to view or update your past routines. Add events directly from the calendar!',
        position: 'right',
        highlightClick: false
      },
      {
        element: '#themeToggle',
        title: '🌙 Dark Mode',
        content: 'Toggle between light and dark themes for comfortable viewing anytime.',
        position: 'bottom',
        highlightClick: false
      },
      {
        element: '#exportBtnSidebar',
        title: '💾 Export Your Data',
        content: 'Download your habit data anytime as a JSON file for backup or analysis.',
        position: 'right',
        highlightClick: false
      },
      {
        element: null,
        title: '🎉 You\'re All Set!',
        content: 'Start building better habits today. Remember: consistency is key! You can restart this tour anytime from the settings.',
        position: 'center'
      }
    ];
  }

  /**
   * Start the tour
   */
  start() {
    console.log('🚀 Starting HabitFlow tour!');
    this.defineTourSteps();
    this.currentStep = 0;
    this.createOverlay();
    this.showStep(0);
  }

  /**
   * Create overlay element
   */
  createOverlay() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'tour-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      z-index: 9998;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    document.body.appendChild(this.overlay);

    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'tour-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      transition: all 0.3s;
      pointer-events: auto;
    `;
    document.body.appendChild(this.tooltip);

    // Add dark theme support
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      this.tooltip.style.background = '#2d2d2d';
      this.tooltip.style.color = '#ffffff';
    }
  }

  /**
   * Show a specific step
   */
  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      this.end();
      return;
    }

    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];
    
    // Clear previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
      el.style.position = '';
      el.style.zIndex = '';
      el.style.background = '';
      el.style.outline = '';
      el.style.outlineOffset = '';
    });

    // Build tooltip content
    const progressPercent = ((stepIndex + 1) / this.steps.length) * 100;
    
    this.tooltip.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${step.title}</div>
        <div style="font-size: 14px; line-height: 1.6; opacity: 0.9;">${step.content}</div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <div style="height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: ${progressPercent}%; transition: width 0.3s;"></div>
        </div>
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.6;">Step ${stepIndex + 1} of ${this.steps.length}</div>
      </div>
      
      <div style="display: flex; justify-content: space-between; gap: 12px;">
        ${stepIndex > 0 ? '<button id="tour-prev" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 14px;">Previous</button>' : '<div></div>'}
        <div style="display: flex; gap: 8px;">
          <button id="tour-skip" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 14px;">Skip Tour</button>
          <button id="tour-next" style="padding: 10px 20px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
            ${stepIndex === this.steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    `;

    // Position tooltip
    if (step.element) {
      const element = document.querySelector(step.element);
      if (element) {
        console.log(`✅ Found element: ${step.element}`);
        this.highlightElement(element);
        this.positionTooltip(element, step.position);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Element not found, position in center
        console.warn(`⚠️ Element not found: ${step.element}, showing in center`);
        this.positionTooltip(null, 'center');
      }
    } else {
      // Center position for welcome/goodbye messages
      this.positionTooltip(null, 'center');
    }

    // Add event listeners
    const nextBtn = document.getElementById('tour-next');
    const prevBtn = document.getElementById('tour-prev');
    const skipBtn = document.getElementById('tour-skip');

    if (nextBtn) {
      nextBtn.onclick = () => this.showStep(stepIndex + 1);
    }
    if (prevBtn) {
      prevBtn.onclick = () => this.showStep(stepIndex - 1);
    }
    if (skipBtn) {
      skipBtn.onclick = () => this.end();
    }

    // Handle dark theme for buttons
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      [prevBtn, skipBtn].forEach(btn => {
        if (btn) {
          btn.style.background = '#3d3d3d';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#555';
        }
      });
    }
  }

  /**
   * Highlight an element
   */
  highlightElement(element) { with better visibility
    element.classList.add('tour-highlight');
    element.style.position = 'relative';
    element.style.zIndex = '9999';
    element.style.background = 'rgba(102, 126, 234, 0.1)';
    element.style.outline = '3px solid rgba(102, 126, 234, 0.8)';
    element.style.outlineOffset = '4px';
    
    // Add pulsing animation
    const style = document.createElement('style');
    style.innerHTML = `
      .tour-highlight {
        animation: tour-pulse 2s infinite !important;
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7) !important;
        border-radius: 8px !important;
      }
      
      @keyframes tour-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
        }
        50% {
          box-shadow: 0 0 0 15rgba(102, 126, 234, 0.7);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
        }
      }
    `;
    if (!document.getElementById('tour-animation-style')) {
      style.id = 'tour-animation-style';
      document.head.appendChild(style);
    }
  }

  /**
   * Position tooltip relative to element
   */
  positionTooltip(element, position) {
    if (!element || position === 'center') {
      // Center on screen
      this.tooltip.style.top = '50%';
      this.tooltip.style.left = '50%';
      this.tooltip.style.transform = 'translate(-50%, -50%)';
      this.tooltip.style.right = 'auto';
      this.tooltip.style.bottom = 'auto';
      return;
    }padding = 20;
    const tooltipWidth = 400; // max-width from CSS
    const tooltipHeight = 300; // estimated height

    this.tooltip.style.transform = 'none';

    let left, top;

    switch (position) {
      case 'top':
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        top = rect.top - tooltipHeight - padding;
        break;
      
      case 'bottom':
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        top = rect.bottom + padding;
        break;
      
      case 'left':
        left = rect.left - tooltipWidth - padding;
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        break;
      
      case 'right':
        left = rect.right + padding;
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        break;
      
      default:
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        top = rect.bottom + padding;
    }

    // Apply initial position
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
    this.tooltip.style.right = 'auto';
    this.tooltip.style.bottom = 'auto';

    // Get actual tooltip dimensions after rendering
    setTimeout(() => {
      const tooltipRect = this.tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 10;

      // Adjust horizontal position
      if (tooltipRect.right > viewportWidth - margin) {
        this.tooltip.style.left = (viewportWidth - tooltipRect.width - margin) + 'px';
      }
      if (tooltipRect.left < margin) {
        this.tooltip.style.left = margin + 'px';
      }

      // Adjust vertical position
      if (tooltipRect.bottom > viewportHeight - margin) {
        // Try to position above element instead
        const newTop = rect.top - tooltipRect.height - padding;
        if (newTop >= margin) {
          this.tooltip.style.top = newTop + 'px';
        } else {
          // If still doesn't fit, center vertically
          this.tooltip.style.top = '50%';
          this.tooltip.style.transform = 'translateY(-50%)';
        }
      }
      if (tooltipRect.top < margin) {
        this.tooltip.style.top = margin + 'px';
      }

      // Ensure tooltip is scrolled into view
      this.tooltip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }, 10);
    if (tooltipNewRect.top < 0) {
      el.style.background = '';
      el.style.outline = '';
      el.style.outlineOffset = '';
      this.tooltip.style.top = padding + 'px';
    }
  }

  /**
   * End the tour
   */
  end() {
    // Mark tour as completed
    localStorage.setItem('habitflow_tour_completed', 'true');
    
    // Remove elements
    if (this.overlay) {
      this.overlay.remove();
    }
    if (this.tooltip) {
      this.tooltip.remove();
    }
    
    // Remove highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
      el.style.position = '';
      el.style.zIndex = '';
    });

    // Remove animation style
    const animStyle = document.getElementById('tour-animation-style');
    if (animStyle) {
      animStyle.remove();
    }
  }

  /**
   * Restart the tour (for settings)
   */
  static restart() {
    localStorage.removeItem('habitflow_tour_completed');
    console.log('🔄 Tour reset - reloading page...');
    window.location.reload();
  }
}

// Auto-initialize when script loads
const tour = new OnboardingTour();
tour.init();

// Expose restart function globally
window.restartHabitFlowTour = () => OnboardingTour.restart();

// Expose tour object for debugging
window.habitFlowTour = tour;

// Add console helper for testing
console.log('🎯 HabitFlow Tour loaded! Commands:');
console.log('  - window.restartHabitFlowTour() - Restart the tour');
console.log('  - window.habitFlowTour - Access tour object');
console.log('  - localStorage.removeItem("habitflow_tour_completed") - Reset tour completion');
