// Service Worker for Habit Tracker PWA
const CACHE_NAME = 'habit-tracker-v5-offline';
const urlsToCache = [
  './',
  './routine-tracker/',
  './routine-tracker/index.html',
  './routine-tracker/analytics.html',
  './routine-tracker/pomodoro.html',
  './routine-tracker/manifest.json',
  './css/style.css',
  './js/app.js',
  './js/analytics.js',
  './js/pomodoro.js',
  './js/routines-data.js',
  './js/wellness-tracker.js',
  './data/routines.json',
  './libs/bootstrap.min.css',
  './libs/bootstrap-icons.css',
  './libs/bootstrap-icons.woff2',
  './libs/bootstrap.bundle.min.js',
  './libs/chart.umd.js',
  './study.mp3',
  './break.mp3',
  './water.mp3',
  './tone2pi.mp3',
  './icon-192.png',
  './icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing v5 (Full Offline Support)...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching all files for complete offline support');
        return cache.addAll(urlsToCache).then(() => {
          console.log('✅ All files cached successfully - App now works 100% offline!');
        }).catch(err => {
          console.error('❌ Failed to cache some files:', err);
          // Continue even if some files fail
        });
      })
      .then(() => {
        console.log('Service Worker: Installation complete, activating...');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating v5 (Full Offline)...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Now controlling all pages - Full offline support active!');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          // Update cache in background for non-critical resources
          if (!event.request.url.includes('chrome-extension') && !event.request.url.includes('localhost')) {
            fetch(event.request).then(netResponse => {
              if (netResponse && netResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, netResponse.clone());
                });
              }
            }).catch(() => {});
          }
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache successful responses
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Offline fallback - try to serve index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/routine-tracker/index.html');
          }
          // Return a simple offline response for other requests
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

// Handle background sync for saving data when back online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  console.log('Service Worker: Syncing data...');
  // Data is stored in localStorage, so it will persist
  return Promise.resolve();
}

// Handle periodic background sync for water reminders (if supported)
if ('periodicsync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'water-reminder') {
      event.waitUntil(checkWaterReminder());
    }
  });
}

function checkWaterReminder() {
  // Check if it's time for water reminder
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Remind at :45 minutes between 6 AM and 11 PM
  if (hour >= 6 && hour <= 23 && minute === 45) {
    return self.registration.showNotification('💧 Water Reminder', {
      body: 'Time to hydrate! Drink 110ml of water.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'water-reminder',
      requireInteraction: false,
      vibrate: [200, 100, 200]
    });
  }
  return Promise.resolve();
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/routine-tracker/index.html')
  );
});

// Enable background notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
