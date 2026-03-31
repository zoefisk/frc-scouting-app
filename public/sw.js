// public/sw.js
const CACHE_NAME = "frc-scouting-v1";
const APP_SHELL = [
    "/",
    "/offline",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // navigation requests: network first, fallback to cached offline page
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/offline"))
        );
        return;
    }

    // app assets: cache first
    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request))
    );
});
