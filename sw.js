/* ══ JAZAN COMMUNITY SW v2 ══ */
const CACHE_NAME = 'jazan-v2';
const URLS = [
  '/jazan-community/',
  '/jazan-community/index.html',
  '/jazan-community/portal.html',
  '/jazan-community/health.html',
  '/jazan-community/register.html',
  '/jazan-community/manifest.json',
  '/jazan-community/portal-manifest.json',
];

// Install — cache all files
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(URLS);
    })
  );
  // Take control immediately
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){
      // Tell all open tabs to reload
      return self.clients.claim();
    })
  );
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function(res){
        if(res && res.status === 200){
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(e.request, clone);
          });
        }
        return res;
      })
      .catch(function(){
        return caches.match(e.request).then(function(cached){
          return cached || new Response('لا يوجد اتصال بالإنترنت', {status: 503});
        });
      })
  );
});

// Message from page — force update
self.addEventListener('message', function(e){
  if(e.data === 'SKIP_WAITING') self.skipWaiting();
});
