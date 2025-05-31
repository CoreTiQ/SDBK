const CACHE_NAME = 'villa-booking-v2.0.0';
const STATIC_CACHE = 'villa-booking-static-v2.0.0';
const DYNAMIC_CACHE = 'villa-booking-dynamic-v2.0.0';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/calendar',
  '/stats',
  '/expenses',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/app.css',
];

// الملفات الديناميكية
const DYNAMIC_ASSETS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// معالجة طلبات الشبكة
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل طلبات المتصفح الداخلية
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://') ||
      request.url.startsWith('safari-extension://')) {
    return;
  }

  // معالجة طلبات Supabase
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // تخزين مؤقت للبيانات المقروءة فقط
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // في حالة عدم توفر الشبكة، محاولة الحصول على البيانات من التخزين المؤقت
          return caches.match(request);
        })
    );
    return;
  }

  // معالجة الملفات الثابتة
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request)
            .then((response) => {
              // تخزين مؤقت للموارد الجديدة
              if (response.ok && shouldCache(request)) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // عرض صفحة غير متصل للتنقل
              if (request.destination === 'document') {
                return caches.match('/offline.html') || 
                       new Response(getOfflineHTML(), {
                         headers: { 'Content-Type': 'text/html; charset=utf-8' }
                       });
              }
            });
        })
    );
  }
});

// تحديد ما إذا كان يجب تخزين الطلب مؤقتاً
function shouldCache(request) {
  const url = new URL(request.url);
  
  // تخزين الخطوط والصور وملفات CSS/JS
  return request.destination === 'font' ||
         request.destination === 'image' ||
         request.destination === 'script' ||
         request.destination === 'style' ||
         url.pathname.startsWith('/_next/static/');
}

// HTML لصفحة عدم الاتصال
function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>غير متصل - نظام حجز الفيلا</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 40px;
          max-width: 400px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0 0 16px 0;
          font-size: 24px;
        }
        p {
          margin: 0 0 24px 0;
          opacity: 0.9;
          line-height: 1.6;
        }
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📶</div>
        <h1>غير متصل بالإنترنت</h1>
        <p>
          يبدو أن اتصالك بالإنترنت منقطع. 
          تحقق من الاتصال وحاول مرة أخرى.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
          إعادة المحاولة
        </button>
      </div>
    </body>
    </html>
  `;
}

// معالجة رسائل من العميل
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// تزامن البيانات في الخلفية
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// دالة التزامن في الخلفية
async function doBackgroundSync() {
  try {
    // يمكن إضافة منطق مزامنة البيانات هنا
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// إشعارات Push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'إشعار جديد من نظام حجز الفيلا',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icons/action-close.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'نظام حجز الفيلا',
      options
    )
  );
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('[SW] Service Worker script loaded');