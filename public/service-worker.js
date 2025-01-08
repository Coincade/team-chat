self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    clients.claim()
      .then(() => {
        // Check if there are any clients
        self.clients.matchAll({ type: 'window' })
          .then(clients => {
            clients.forEach(client => {
              // If client is on the install page, redirect to /auth
              if (client.url.includes('/install')) {
                client.navigate('/auth');
              }
            });
          });
      })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  event.respondWith(fetch(event.request));
});