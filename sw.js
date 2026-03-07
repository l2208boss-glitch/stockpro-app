/* StockPro — Service Worker
   Estratégia:
   - HTML (estoque.html, raiz): NETWORK-FIRST → sempre busca versão nova da rede,
     cai para cache só se offline.
   - Firebase SDKs (gstatic.com): CACHE-FIRST → grandes e estáticos, não mudam.
   - Firestore/Auth API: passa direto, tem cache próprio offline.
*/

const CACHE_NAME = 'stockpro-v31';

const STATIC_ASSETS = [
  '/stockpro-app/icon.svg',
  '/stockpro-app/manifest.json',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
];

// Instala: pré-cacheia só os assets estáticos (NÃO o HTML)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativa: limpa caches antigos e assume controle imediatamente
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Permite que a página force a ativação imediata do novo SW
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Firestore/Auth passam direto — têm cache offline próprio
  if (url.includes('firestore.googleapis.com') ||
      url.includes('googleapis.com/google.firestore') ||
      url.includes('securetoken.googleapis.com') ||
      url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // HTML (navegação): NETWORK-FIRST — sempre tenta buscar versão nova
  if (event.request.mode === 'navigate' ||
      url.endsWith('.html') ||
      url.endsWith('/stockpro-app/') ||
      url.endsWith('/stockpro-app')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Guarda cópia nova no cache para uso offline
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached || caches.match('/stockpro-app/estoque.html'))
        )
    );
    return;
  }

  // Assets estáticos (Firebase SDKs, ícones): CACHE-FIRST
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (url.includes('gstatic.com') && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
