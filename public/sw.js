const CACHE_NAME = 'your-app-cache-v1';
const urlsToCache = [
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

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
    console.log(event.request);
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip Chrome extension requests and other cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Handle navigation requests (e.g., '/')
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetchWithRedirect(event.request)
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
            fetchWithRedirect(event.request)
                .catch(() => {
                    return new Response(JSON.stringify({ error: 'You are offline' }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // Handle static assets (manifest, icons, etc.)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetchWithRedirect(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
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

/**
 * Wrapper function for fetch to ensure redirect handling.
 * @param {Request} request - The original request object.
 * @returns {Promise<Response>} The fetch promise.
 */
function fetchWithRedirect(request) {
    return fetch(request, {
        credentials: 'include',
        redirect: 'follow'
    });
}