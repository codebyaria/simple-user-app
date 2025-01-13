const CACHE_NAME = 'your-app-cache-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'  // Make sure you have this file
];

// Helper function to handle network requests with timeout
const timeoutFetch = (request, timeout = 5000) => {
    return Promise.race([
        fetch(request),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
        )
    ]);
};

self.addEventListener('install', (event) => {
    // Immediately activate the service worker
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    const networkFirst = async () => {
        try {
            const networkResponse = await timeoutFetch(event.request, {
                redirect: 'follow',
                credentials: 'include'
            });
            
            // Clone the response before returning it
            const responseToCache = networkResponse.clone();
            
            // Cache the successful response
            if (responseToCache.status === 200) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, responseToCache);
            }
            
            return networkResponse;
        } catch (err) {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // If it's a navigation request, return the offline page
            if (event.request.mode === 'navigate') {
                const cache = await caches.open(CACHE_NAME);
                return cache.match('/offline.html');
            }
            
            // For other requests, return a basic error response
            return new Response('Network error occurred', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' }
            });
        }
    };

    event.respondWith(networkFirst());
});

self.addEventListener('activate', (event) => {
    // Claim control immediately
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});