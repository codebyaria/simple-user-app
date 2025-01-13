const CACHE_NAME = 'your-app-cache-v2';
const urlsToCache = [
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .catch((err) => {
                console.error('Error during cache installation:', err);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Debugging request information
    console.log('Handling fetch for:', event.request.url);

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Handle navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request, {
                credentials: 'include',
                redirect: 'manual', // Prevent automatic redirect handling
            })
                .then((response) => {
                    // Handle manual redirects
                    if (response.type === 'opaqueredirect') {
                        return Response.redirect(response.url, response.status);
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match('/offline.html') || new Response('Offline page not available', {
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' },
                    });
                })
        );
        return;
    }
    
    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            handleFetch(event.request, new Response(JSON.stringify({ error: 'You are offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            }))
        );
        return;
    }

    // Handle static assets
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => cachedResponse || handleFetch(event.request))
            .catch((err) => {
                console.error('Error handling static asset fetch:', err);
                return new Response('Failed to fetch resource', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' },
                });
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

/**
 * Helper function to handle fetch with error handling and redirect support.
 * @param {Request} request - The original request.
 * @param {Response | string} [fallback] - Fallback response or URL for offline.
 * @returns {Promise<Response>} - The fetch result or fallback.
 */
function handleFetch(request, fallback) {
    return fetch(request, {
        credentials: 'include',
        redirect: 'follow',
    })
        .then((response) => {
            if (!response.ok) {
                console.warn('Fetch returned a non-OK response:', response.status, response.statusText);
                throw new Error('Fetch failed with non-OK status');
            }
            return response;
        })
        .catch((err) => {
            console.error('Fetch failed for:', request.url, err);
            if (typeof fallback === 'string') {
                return caches.match(fallback);
            }
            return fallback || new Response('Offline or fetch error occurred.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' },
            });
        });
}