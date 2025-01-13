const CACHE_NAME = 'customer-management-v1';

async function cacheCoreAssets() {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll([
        '/login',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/offline.html'
    ]);
}

self.addEventListener("install", (event) => {
    event.waitUntil(cacheCoreAssets());
    self.skipWaiting();
});

async function clearOldCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
    );
}

self.addEventListener("activate", (event) => {
    event.waitUntil(clearOldCaches());
    self.clients.claim();
});

async function dynamicCaching(request) {
    // Only cache GET requests
    if (request.method !== 'GET') {
        return fetch(request);
    }

    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);

        // Only cache successful responses
        if (response.ok && response.type === 'basic') {
            const responseClone = response.clone();
            await cache.put(request, responseClone);
        }

        return response;
    } catch (error) {
        console.error("Dynamic caching failed:", error);
        const cachedResponse = await cache.match(request);
        return cachedResponse || new Response("Network error", { status: 500 });
    }
}

async function cacheFirstStrategy(request) {
    // Only apply cache-first to GET requests
    if (request.method !== 'GET') {
        return fetch(request);
    }

    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            await cache.put(request, responseClone);
        }

        return networkResponse;
    } catch (error) {
        console.error("Cache first strategy failed:", error);
        return caches.match("/offline.html");
    }
}

async function networkFirstStrategy(request) {
    // For POST requests, just forward to network
    if (request.method !== 'GET') {
        return fetch(request);
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            const responseClone = networkResponse.clone();
            await cache.put(request, responseClone);
        }

        return networkResponse;
    } catch (error) {
        console.error("Network first strategy failed:", error);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response("[]", {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // List of origins to use network-first strategy
    const networkFirstOrigins = [
        "https://simple-user-app-pink.vercel.app",
        "https://simple-customer-app.vercel.app"
    ];

    if (networkFirstOrigins.includes(url.origin)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (request.mode === "navigate") {
        event.respondWith(cacheFirstStrategy(request));
    } else {
        event.respondWith(dynamicCaching(request));
    }
});