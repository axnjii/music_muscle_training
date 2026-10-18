const CACHE_NAME = 'docnotnhac-cache-v2'; // Đổi tên để trình duyệt biết có bản mới

const urlsToCache = [
  './',
  './index.html'
];

// 1. Cài đặt Service Worker và lưu bộ nhớ đệm ban đầu
self.addEventListener('install', event => {
  // Yêu cầu Service Worker mới kích hoạt ngay lập tức mà không cần chờ tab đóng
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Đã mở cache bản mới:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. MÃ DỌN DẸP CACHE CŨ (Sự kiện Activate)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Nếu tên cache đang kiểm tra khác với CACHE_NAME hiện tại thì xóa đi
          if (cacheName !== CACHE_NAME) {
            console.log('Đã xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Đảm bảo Service Worker mới kiểm soát trang ngay lập tức
  return self.clients.claim(); 
});

// 3. Xử lý khi có request mạng (Fetch)
self.addEventListener('fetch', event => {
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          function(networkResponse) {
            if(!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }
            
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          }
        ).catch(() => {
            console.log('Đang offline và không tìm thấy file:', event.request.url);
        });
      })
  );
});