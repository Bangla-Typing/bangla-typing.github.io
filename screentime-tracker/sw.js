const CACHE_NAME = "screen-usage-analyzer-v1";

// List of all the essential files that make up the app shell
const urlsToCache = [
	".", //  This caches the root URL (your index.html)
	"index.html",
	"manifest.json",
	"https://fonts.googleapis.com/icon?family=Material+Icons",
	"https://code.getmdl.io/1.3.0/material.indigo-pink.min.css",
	"https://code.getmdl.io/1.3.0/material.min.js",
	"https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js",
	"https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js",
	"icons/icon-192x192.png",
	"icons/icon-512x512.png",
];

// Install event: cache the app shell
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Opened cache and caching app shell");
			return cache.addAll(urlsToCache);
		})
	);
	self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						console.log("Deleting old cache:", cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

// Fetch event: serve from cache first (offline-first strategy)
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// If the resource is in the cache, return it
			if (response) {
				return response;
			}
			// Otherwise, fetch it from the network
			return fetch(event.request);
		})
	);
});
