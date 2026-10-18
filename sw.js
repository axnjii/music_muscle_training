const CACHE_NAME = 'docnotnhac-cache-v6';

// Danh sách các file cần lưu offline ngay lập tức
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './apple-touch-icon.png',
  
  // --- ÂM THANH PIANO ---
  'https://tonejs.github.io/audio/salamander/C4.mp3',
  'https://tonejs.github.io/audio/salamander/Ds4.mp3',
  'https://tonejs.github.io/audio/salamander/Fs4.mp3',
  'https://tonejs.github.io/audio/salamander/A4.mp3',

  // --- ÂM THANH GUITAR ---
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/A2.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/C3.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/E3.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/A3.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/C4.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/E4.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/A4.mp3',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/C5.mp3'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Đã mở cache bản mới và đang tải sẵn âm thanh:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Đã xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('generativelanguage.googleapis.com')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response; // Có trong cache thì trả về ngay (Offline chạy ngon)
        
        return fetch(event.request).then(
          function(networkResponse) {
            // Nới lỏng kiểm tra: Nếu là file âm thanh (đuôi mp3) thì lưu hết không cần check strict CORS
            const isAudio = event.request.url.endsWith('.mp3');
            
            if(!networkResponse || (networkResponse.status !== 200 && !isAudio && networkResponse.type !== 'opaque')) {
              return networkResponse;
            }
            
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, responseToCache);
            });
              
            return networkResponse;
          }
        ).catch(() => {
            console.log('Lỗi offline file:', event.request.url);
        });
      })
  );
});