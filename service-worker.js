// 墨韵字帖 Service Worker
const CACHE_NAME = 'moyun-calligraphy-v1';
const CORE_FILES = [
  './',
  './墨韵字帖.html',
  './manifest.json'
];

// 安装：缓存核心文件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_FILES);
    }).then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', (event) => {
  // 只缓存GET请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 如果缓存中有，直接返回
      if (cached) return cached;

      // 否则从网络获取
      return fetch(event.request).then((response) => {
        // 缓存成功的响应
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // 网络失败时，如果是图片请求，返回缓存的占位
        return caches.match('./墨韵字帖.html');
      });
    })
  );
});
