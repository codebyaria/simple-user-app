const CACHE_NAME = 'your-app-cache-v1';
const urlsToCache = [
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

// Don't include '/' in urlsToCache since it requires auth

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip Chrome extension requests and other cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Handle navigation requests (like / or /customers)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request, {
                credentials: 'include',
                redirect: 'follow'
            })
            .catch(() => {
                return caches.match('/offline.html')
                    .then(response => response || new Response('Offline page not available', {
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' }
                    }));
            })
        );
        return;
    }

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request, {
                credentials: 'include',
                redirect: 'follow'
            })
            .catch(() => {
                return new Response(JSON.stringify({ error: 'You are offline' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Handle static assets (manifest, icons, etc)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not successful
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Cache successful responses for static assets
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return a basic error for failed asset requests
                        return new Response('Failed to fetch resource', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
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