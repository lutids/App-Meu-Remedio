const CACHE_NAME = 'meu-remedio-v1';
const urlsToCache = [
  '/App-Meu-Remedio/',
  '/App-Meu-Remedio/index.html',
  '/App-Meu-Remedio/manifest.json',
  '/App-Meu-Remedio/icon-192.png',
  '/App-Meu-Remedio/icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache error:', err))
  );
});

// Ativação e limpeza de cache antigo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache first, then network
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Se falhar, retorna página offline
          return caches.match('/App-Meu-Remedio/index.html');
        });
      })
  );
});

// Notificações em background
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;

  if (action === 'taken') {
    notification.close();
  } else if (action === 'snooze') {
    notification.close();
    setTimeout(() => {
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon
      });
    }, 10 * 60 * 1000);
  } else {
    event.waitUntil(
      clients.openWindow('/App-Meu-Remedio/')
    );
    notification.close();
  }
});