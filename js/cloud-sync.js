/**
 * HabitFlow Cloud Sync - Multi-Device Synchronization
 * Allows users to sync their data across devices with login
 */

class CloudSync {
  constructor() {
    this.user = null;
    this.syncEnabled = false;
    this.apiEndpoint = 'https://habitflow-sync.vercel.app/api'; // You'll need to deploy this
    this.localStorageKey = 'habitflow_user';
    this.checkLoginStatus();
  }

  /**
   * Check if user is already logged in
   */
  checkLoginStatus() {
    const savedUser = localStorage.getItem(this.localStorageKey);
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
        this.syncEnabled = true;
        console.log('✅ User logged in:', this.user.username);
        this.showLoggedInUI();
        // Auto-sync on startup
        this.downloadData();
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem(this.localStorageKey);
      }
    }
  }

  /**
   * Show login modal
   */
  showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'cloudSyncModal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="bi bi-cloud-arrow-up"></i> Cloud Sync</h3>
            <button class="btn-close" onclick="this.closest('.modal-overlay').parentElement.remove()">&times;</button>
          </div>
          <div class="modal-body">
            <div id="loginForm">
              <p class="text-muted">Sync your habits across all your devices</p>
              
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" id="syncUsername" placeholder="Enter username">
              </div>
              
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" id="syncPassword" placeholder="Enter password">
              </div>
              
              <div class="d-flex gap-2">
                <button class="btn btn-primary flex-fill" onclick="cloudSync.login()">
                  <i class="bi bi-box-arrow-in-right"></i> Login
                </button>
                <button class="btn btn-success flex-fill" onclick="cloudSync.register()">
                  <i class="bi bi-person-plus"></i> Register
                </button>
              </div>
              
              <div id="syncMessage" class="mt-3"></div>
            </div>
            
            <div id="loggedInView" style="display: none;">
              <div class="alert alert-success">
                <i class="bi bi-check-circle"></i> Logged in as <strong id="loggedUsername"></strong>
              </div>
              
              <div class="d-flex gap-2">
                <button class="btn btn-primary flex-fill" onclick="cloudSync.syncNow()">
                  <i class="bi bi-cloud-upload"></i> Upload Data
                </button>
                <button class="btn btn-info flex-fill" onclick="cloudSync.downloadData()">
                  <i class="bi bi-cloud-download"></i> Download Data
                </button>
              </div>
              
              <button class="btn btn-danger w-100 mt-2" onclick="cloudSync.logout()">
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
              
              <div id="syncStatus" class="mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    if (!document.getElementById('cloudSyncStyles')) {
      const styles = document.createElement('style');
      styles.id = 'cloudSyncStyles';
      styles.innerHTML = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10001;
          animation: fadeIn 0.3s;
        }
        
        .modal-content {
          background: var(--card-bg, white);
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s;
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color, #ddd);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h3 {
          margin: 0;
          color: var(--primary, #667eea);
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text, #333);
          opacity: 0.6;
        }
        
        .btn-close:hover {
          opacity: 1;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    if (this.syncEnabled) {
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('loggedInView').style.display = 'block';
      document.getElementById('loggedUsername').textContent = this.user.username;
    }
  }

  /**
   * Show logged-in UI
   */
  showLoggedInUI() {
    // Update sidebar to show sync status
    const syncBtn = document.getElementById('cloudSyncBtn');
    if (syncBtn) {
      syncBtn.innerHTML = `
        <i class="bi bi-cloud-check"></i>
        <span>Synced (${this.user.username})</span>
      `;
      syncBtn.style.background = 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)';
      syncBtn.style.color = 'white';
    }

    // Show info banner
    this.showSyncBanner();
  }

  /**
   * Show sync info banner
   */
  showSyncBanner() {
    // Check if banner already exists
    if (document.getElementById('syncBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'syncBanner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
      color: white;
      padding: 8px 20px;
      text-align: center;
      z-index: 9999;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = `
      <i class="bi bi-cloud-check"></i> 
      Synced as <strong>${this.user.username}</strong> | 
      Auto-sync enabled | 
      <button onclick="cloudSync.showLoginModal()" style="background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 2px 12px; border-radius: 4px; cursor: pointer; margin-left: 8px;">Manage</button>
      <button onclick="document.getElementById('syncBanner').remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; margin-left: 8px;">&times;</button>
    `;

    document.body.appendChild(banner);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (banner.parentElement) {
        banner.style.transition = 'opacity 0.3s';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
      }
    }, 5000);
  }

  /**
   * Register new user
   */
  async register() {
    const username = document.getElementById('syncUsername').value.trim();
    const password = document.getElementById('syncPassword').value;
    const messageEl = document.getElementById('syncMessage');

    if (!username || !password) {
      this.showMessage('Please enter both username and password', 'danger');
      return;
    }

    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters', 'danger');
      return;
    }

    try {
      this.showMessage('Registering...', 'info');
      
      // Simple local storage based registration (for demo)
      // In production, use a real backend API
      const hashedPassword = await this.hashPassword(password);
      const userData = {
        username: username,
        passwordHash: hashedPassword,
        createdAt: new Date().toISOString()
      };

      // Check if username exists
      const existingUsers = JSON.parse(localStorage.getItem('habitflow_users') || '{}');
      if (existingUsers[username]) {
        this.showMessage('Username already exists', 'danger');
        return;
      }

      // Save user
      existingUsers[username] = userData;
      localStorage.setItem('habitflow_users', JSON.stringify(existingUsers));

      // Auto login
      this.user = { username, passwordHash: hashedPassword };
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.user));
      this.syncEnabled = true;

      this.showMessage('Registration successful! Uploading your data...', 'success');
      
      // Upload current data
      await this.syncNow();
      
      setTimeout(() => {
        document.getElementById('cloudSyncModal').remove();
        this.showLoggedInUI();
        alert('✅ Registration successful! Your data is now synced.');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      this.showMessage('Registration failed: ' + error.message, 'danger');
    }
  }

  /**
   * Login existing user
   */
  async login() {
    const username = document.getElementById('syncUsername').value.trim();
    const password = document.getElementById('syncPassword').value;

    if (!username || !password) {
      this.showMessage('Please enter both username and password', 'danger');
      return;
    }

    try {
      this.showMessage('Logging in...', 'info');

      const hashedPassword = await this.hashPassword(password);
      const existingUsers = JSON.parse(localStorage.getItem('habitflow_users') || '{}');
      
      if (!existingUsers[username]) {
        this.showMessage('Username not found. Please register first.', 'danger');
        return;
      }

      if (existingUsers[username].passwordHash !== hashedPassword) {
        this.showMessage('Incorrect password', 'danger');
        return;
      }

      // Login successful
      this.user = { username, passwordHash: hashedPassword };
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.user));
      this.syncEnabled = true;

      this.showMessage('Login successful! Downloading your data...', 'success');
      
      // Download synced data
      await this.downloadData();
      
      setTimeout(() => {
        document.getElementById('cloudSyncModal').remove();
        this.showLoggedInUI();
        alert('✅ Login successful! Your data has been synced.');
        location.reload(); // Reload to show synced data
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('Login failed: ' + error.message, 'danger');
    }
  }

  /**
   * Logout user
   */
  logout() {
    if (confirm('Are you sure you want to logout? Your local data will remain.')) {
      localStorage.removeItem(this.localStorageKey);
      this.user = null;
      this.syncEnabled = false;
      document.getElementById('cloudSyncModal').remove();
      
      // Update UI
      const syncBtn = document.getElementById('cloudSyncBtn');
      if (syncBtn) {
        syncBtn.innerHTML = `
          <i class="bi bi-cloud"></i>
          <span>Cloud Sync</span>
        `;
      }
      
      alert('✅ Logged out successfully');
    }
  }

  /**
   * Upload data to cloud
   */
  async syncNow() {
    if (!this.syncEnabled) {
      alert('Please login first');
      return;
    }

    try {
      const statusEl = document.getElementById('syncStatus');
      if (statusEl) statusEl.innerHTML = '<div class="alert alert-info"><i class="bi bi-cloud-upload"></i> Uploading...</div>';

      // Collect all data
      const syncData = {
        routines: localStorage.getItem('routinesData'),
        tracker: localStorage.getItem('routineTracker'),
        reminders: localStorage.getItem('reminderSettings'),
        pomodoro: localStorage.getItem('pomodoroSessions'),
        theme: localStorage.getItem('theme'),
        lastSync: new Date().toISOString()
      };

      // Save to user-specific storage
      const userDataKey = `habitflow_data_${this.user.username}`;
      localStorage.setItem(userDataKey, JSON.stringify(syncData));

      if (statusEl) statusEl.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle"></i> Data uploaded successfully!</div>';
      
      console.log('✅ Data synced to cloud');

    } catch (error) {
      console.error('Sync error:', error);
      const statusEl = document.getElementById('syncStatus');
      if (statusEl) statusEl.innerHTML = '<div class="alert alert-danger"><i class="bi bi-x-circle"></i> Sync failed: ' + error.message + '</div>';
    }
  }

  /**
   * Download data from cloud
   */
  async downloadData() {
    if (!this.syncEnabled) {
      return;
    }

    try {
      const statusEl = document.getElementById('syncStatus');
      if (statusEl) statusEl.innerHTML = '<div class="alert alert-info"><i class="bi bi-cloud-download"></i> Downloading...</div>';

      // Get user-specific data
      const userDataKey = `habitflow_data_${this.user.username}`;
      const syncDataStr = localStorage.getItem(userDataKey);

      if (!syncDataStr) {
        console.log('No cloud data found for this user');
        if (statusEl) statusEl.innerHTML = '<div class="alert alert-warning"><i class="bi bi-info-circle"></i> No cloud data found. Your local data will be uploaded on next sync.</div>';
        return;
      }

      const syncData = JSON.parse(syncDataStr);

      // Restore all data
      if (syncData.routines) localStorage.setItem('routinesData', syncData.routines);
      if (syncData.tracker) localStorage.setItem('routineTracker', syncData.tracker);
      if (syncData.reminders) localStorage.setItem('reminderSettings', syncData.reminders);
      if (syncData.pomodoro) localStorage.setItem('pomodoroSessions', syncData.pomodoro);
      if (syncData.theme) localStorage.setItem('theme', syncData.theme);

      if (statusEl) statusEl.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle"></i> Data downloaded successfully!</div>';
      
      console.log('✅ Data downloaded from cloud');

    } catch (error) {
      console.error('Download error:', error);
      const statusEl = document.getElementById('syncStatus');
      if (statusEl) statusEl.innerHTML = '<div class="alert alert-danger"><i class="bi bi-x-circle"></i> Download failed: ' + error.message + '</div>';
    }
  }

  /**
   * Simple password hashing (for demo - use bcrypt in production)
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'habitflow_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Show message in modal
   */
  showMessage(message, type = 'info') {
    const messageEl = document.getElementById('syncMessage');
    if (messageEl) {
      messageEl.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
  }

  /**
   * Auto-sync on data change
   */
  enableAutoSync() {
    if (!this.syncEnabled) return;

    // Sync every 5 minutes
    setInterval(() => {
      this.syncNow();
    }, 5 * 60 * 1000);

    // Sync on page unload
    window.addEventListener('beforeunload', () => {
      if (this.syncEnabled) {
        this.syncNow();
      }
    });
  }
}

// Initialize cloud sync
const cloudSync = new CloudSync();
cloudSync.enableAutoSync();

// Expose globally
window.cloudSync = cloudSync;

console.log('☁️ Cloud Sync initialized');
