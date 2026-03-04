/* StockPro — Service Worker
   Estratégia: cache-first para o shell do app,
   network-first para o Firebase (Firestore já tem seu próprio cache offline).
*/

const CACHE_NAME = 'stockpro-v3';

// Arquivos do app que ficam em cache (shell)
const SHELL = [
  '/stockpro-app/',
  '/stockpro-app/estoque.html',
  '/stockpro-app/icon.svg',
  '/stockpro-app/manifest.json',
  // Firebase SDKs via CDN — ficam em cache após primeira carga
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
];

// Instala e pré-cacheia o shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// Limpa caches antigos ao ativar nova versão
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Intercept de requisições: cache-first para shell, passa direto Firebase Auth/Firestore
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Deixa o Firestore/Auth passar direto — ele tem cache próprio offline
  if (url.includes('firestore.googleapis.com') ||
      url.includes('googleapis.com/google.firestore') ||
      url.includes('securetoken.googleapis.com') ||
      url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Guarda em cache arquivos do gstatic (Firebase SDKs)
        if (url.includes('gstatic.com') && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Se offline e não está em cache, retorna o app shell
        if (event.request.mode === 'navigate') {
          return caches.match('/stockpro-app/estoque.html');
        }
      });
    })
  );
});
