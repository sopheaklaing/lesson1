const CACHE_NAME = "todo-cache-v3";  // change version when updating
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js"
];

// INSTALL SW
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// ACTIVATE SW
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// FETCH
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(response =>
            response || fetch(event.request)
        )
    );
});
