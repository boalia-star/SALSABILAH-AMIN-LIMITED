const CACHE_NAME = 'salsabilah-cache-v3.5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // আপনার অন্যান্য স্ট্যাটিক ফাইল বা স্টাইলশীট থাকলে এখানে যোগ করতে পারেন
];

// ১. ইনস্টল ইভেন্ট: কোর ফাইলগুলো ক্যাশ করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Salsabilah Service Worker: Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ২. অ্যাক্টিভেট ইভেন্ট: পুরনো ক্যাশ পরিষ্কার করা
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Salsabilah Service Worker: Clearing Old Cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ৩. ফেচ ইভেন্ট: ক্যাশ ফার্স্ট স্ট্র্যাটেজি (Cache-First with Network Fallback)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ক্যাশ পেলে ক্যাশ থেকে দিবে, না পেলে নেটওয়ার্ক থেকে ফেচ করবে
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // নতুন রেসপন্সগুলো চাইলে এখানে ডাইনামিক ক্যাশ করতে পারেন
        return networkResponse;
      }).catch(() => {
        // অফলাইন ফলব্যাক পেজ বা হ্যান্ডলিং এখানে রাখা যেতে পারে
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
