// Push notification handlers for CityPulse PWA
// This will be added to the service worker

self.addEventListener('push', function (event) {
    console.log('📱 Push event received:', event);

    if (!event.data) {
        console.log('⚠️ Push event has no data');
        return;
    }

    let data;
    try {
        data = event.data.json();
    } catch (error) {
        console.error('❌ Failed to parse push data:', error);
        data = {
            title: 'CityPulse Notification',
            body: event.data.text() || 'New notification available',
            icon: '/icons/icon-192x192.svg'
        };
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.svg',
        badge: data.badge || '/icons/icon-96x96.svg',
        tag: data.tag || 'citypulse-notification',
        timestamp: data.timestamp || Date.now(),
        requireInteraction: false,
        actions: data.actions || [
            {
                action: 'open',
                title: 'View',
                icon: '/icons/icon-96x96.svg'
            },
            {
                action: 'close',
                title: 'Dismiss'
            }
        ],
        data: {
            url: data.url || '/',
            timestamp: data.timestamp || Date.now(),
            tag: data.tag
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
            .then(() => {
                console.log('✅ Notification shown successfully');
            })
            .catch((error) => {
                console.error('❌ Failed to show notification:', error);
            })
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('🔔 Notification clicked:', event.notification);

    event.notification.close();

    if (event.action === 'close') {
        console.log('❌ User dismissed notification');
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';
    console.log('🔗 Opening URL:', urlToOpen);

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Check if app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(window.location.origin) && 'focus' in client) {
                    console.log('🎯 Focusing existing window');
                    return client.focus();
                }
            }

            // Open new window if not already open
            if (clients.openWindow) {
                console.log('🆕 Opening new window');
                return clients.openWindow(urlToOpen);
            }
        }).catch((error) => {
            console.error('❌ Failed to handle notification click:', error);
        })
    );
});

self.addEventListener('notificationclose', function (event) {
    console.log('🔕 Notification closed:', event.notification.tag);
});

console.log('🔄 CityPulse push notification handlers loaded');
