// Development service worker for push notifications
// This will be used when PWA is disabled in development mode

// Import push notification handlers
importScripts('/push-sw.js');

console.log('🔄 Development service worker loaded');

// Basic service worker installation
self.addEventListener('install', function (event) {
    console.log('📦 Service worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('✅ Service worker activated');
    event.waitUntil(self.clients.claim());
});

// Basic fetch handler (minimal caching for development)
self.addEventListener('fetch', function (event) {
    // Let the browser handle all requests in development
    // No caching to avoid development issues
});

console.log('✅ Development service worker ready for push notifications');