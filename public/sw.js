const CACHE_NAME = 'your-app-cache-v1';
const urlsToCache = [
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Special handling for navigation requests that might involve auth redirects
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request, {
                redirect: 'follow',
                credentials: 'include' // Important for auth requests
            })
            .catch(() => {
                return caches.match('/offline.html')
                    .then(response => response || new Response('Offline page not found', {
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' },
                    }));
            })
        );
        return;
    }

    // Handle non-navigation requests (assets, API calls, etc.)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request, {
                    redirect: 'follow',
                    credentials: 'include'
                })
                .then((response) => {
                    // Don't cache if not successful or if it's an API request
                    if (!response || response.status !== 200 || request.url.includes('/api/')) {
                        return response;
                    }

                    // Cache successful responses for non-API requests
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                if (event.request.url.includes('/api/')) {
                    return new Response('API unavailable offline', {
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' },
                    });
                }
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});