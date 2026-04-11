const CACHE_NAME = "frc-scouting-v6";

const APP_SHELL = [
  "/",
  "/offline",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/scan",
  "/alliance-selector",
  "/settings",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache individually so one bad URL does not kill the whole install.
      await Promise.allSettled(
        APP_SHELL.map(async (path) => {
          try {
            await cache.add(path);
          } catch (err) {
            console.warn("[SW] Failed to precache:", path, err);
          }
        })
      );
    })()
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Skip API and server-heavy routes
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/analysis")
  ) {
    return;
  }

  // Let Next.js build assets come from the network. Cache-first chunk loading
  // can leave the client with stale module graphs after file moves/renames.
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // Page navigations: network first, then exact cached page, then offline page
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response && response.ok) {
            const clone = response.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, clone);
          }

          return response;
        } catch {
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }

          const offlinePage = await caches.match("/offline");
          if (offlinePage) {
            return offlinePage;
          }

          const homePage = await caches.match("/");
          if (homePage) {
            return homePage;
          }

          return new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })()
    );
    return;
  }

  // Other assets: cache first, then network
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);

        if (response && response.ok) {
          const clone = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, clone);
        }

        return response;
      } catch {
        if (request.destination === "image") {
          const favicon = await caches.match("/favicon.ico");
          if (favicon) {
            return favicon;
          }
        }

        return new Response("Offline asset unavailable", {
          status: 504,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })()
  );
});
