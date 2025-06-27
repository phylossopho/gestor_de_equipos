// sw.js - Versión corregida con rutas relativas
const CACHE_NAME = 'materiales-pwa-v3';
const urlsToCache = [
  '/',
  'index.html',
  'estilos/principal.css',
  'estilos/tablas.css',
  'estilos/modales.css',
  'estilos/galeria.css',
  'estilos/responsive.css',
  'scripts/app.js',
  'scripts/eventos.js',
  'scripts/ui.js',
  'scripts/csv.js',
  'scripts/modales.js',
  'scripts/simulacion.js',
  'scripts/materiales.js',
  'scripts/conversiones.js',
  'scripts/galeria.js',
  'scripts/datos.js',
  'images/botas.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierta');
                // Cachear recursos uno por uno manejando errores
                const cachePromises = urlsToCache.map(url => {
                    return fetch(url)
                        .then(response => {
                            if (response.ok) {
                                return cache.put(url, response);
                            }
                            console.warn(`No se pudo cachear ${url}: ${response.status}`);
                            return Promise.resolve();
                        })
                        .catch(error => {
                            console.warn(`Error al cachear ${url}:`, error);
                            return Promise.resolve();
                        });
                });

                return Promise.all(cachePromises);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Manejar errores de fetch para recursos no cacheados
                        return new Response('Modo offline - Recurso no disponible', {
                            status: 503,
                            statusText: 'Offline',
                            headers: new Headers({'Content-Type': 'text/plain'})
                        });
                    });
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});