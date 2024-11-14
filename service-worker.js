const CACHE_NAME = 'shopping-list-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    'list128x128.png',
    'list512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache opened');
                return cache.addAll(ASSETS).catch(error => {
                    console.error('Error caching assets:', error);
                });
            })
    );
});

// Activación del Service Worker
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

// Estrategia de cache: Network First con fallback a cache
self.addEventListener('fetch', (event) => {
    // No interceptar peticiones a Firebase
    if (event.request.url.includes('firebasestorage.googleapis.com') ||
        event.request.url.includes('www.googleapis.com') ||
        event.request.url.includes('firestore.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        // Si el recurso no está en caché y la red falla
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return new Response('Sin conexión', {
                            status: 503,
                            statusText: 'Sin conexión'
                        });
                    });
            })
    );
});

// Manejo de errores
self.addEventListener('error', function(event) {
    console.error('Service Worker Error:', event.error);
});


