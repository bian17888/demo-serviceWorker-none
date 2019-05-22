const version = 'v1';

self.addEventListener('install', function (event) {
    console.log('SW %s Installed at', version, new Date().toLocaleTimeString());

    const preCache = async () => {
        const cache = await caches.open(version);
        return cache.addAll([
            'resources/offline.html',
            // local
            'resources/css/index.css',
            'resources/js/index2.js',
            'resources/images/1.jpeg',
            'resources/images/2.jpeg',
            'resources/images/3.jpeg',
            'resources/images/4.jpg',
            // reomote
            'https://img.alicdn.com/tfs/TB1CEMxGkvoK1RjSZFDXXXY3pXa-940-180.jpg'
        ]);
    }

    event.waitUntil(preCache());
})

self.addEventListener('activate', function (event) {
    console.log('SW %s Activated at', version, new Date().toLocaleTimeString());

    const clearCache = async () => {
        const keys = await caches.keys();
        const oldKeys = keys.filter(key => key !== version);
        const promiseKeys = oldKeys.map(key => caches.delete(key));
        return Promise.all(promiseKeys);
    }

    event.waitUntil(clearCache());
})

self.addEventListener('fetch', function (event) {
    console.log('===== fetch =====')
    console.log(event.request)

    const fetchAndUpdate = async () => {
        if (!navigator.onLine) {
            return caches.match(new Request('resources/offline.html'))
        }

        const promiseRes = await caches.match(event.request);
        if (promiseRes) {
            return promiseRes;
        }

        const res = await fetch(event.request);
        if (res) {
            const cache = await caches.open(version);
            await cache.put(event.request, res.clone());
        }

        return res;
    }

    event.respondWith(fetchAndUpdate())
})