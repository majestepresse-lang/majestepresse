// Service Worker — MAJESTÉ PRESSE PWA
// Version du cache
const CACHE_NAME = 'majeste-presse-v1';

// Fichiers à mettre en cache pour le mode hors ligne
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation du Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Service Worker: Mise en cache des fichiers');
      return cache.addAll(FILES_TO_CACHE);
    }).catch(function(err) {
      console.log('Service Worker: Erreur cache:', err);
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activé');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Retourner depuis le cache si disponible
      if (response) {
        return response;
      }
      // Sinon faire la requête réseau
      return fetch(event.request).then(function(networkResponse) {
        // Mettre en cache la nouvelle réponse
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Hors ligne - retourner la page principale depuis le cache
        return caches.match('/index.html');
      });
    })
  );
});
