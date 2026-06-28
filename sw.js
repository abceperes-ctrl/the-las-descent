self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', event => {
  const { type, title, body, tag } = event.data || {};
  if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(title || 'Cedano Business', {
      body: body || '',
      tag: tag || 'cedano',
      icon: '/the-las-descent/icon-192.png'
    });
  }
  if (type === 'CHECK_AND_NOTIFY') {
    // lógica de verificación periódica si la necesitas
  }
});
