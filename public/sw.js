importScripts('./src/js/idb.js');
importScripts('./src/js/db.js');

let CACHE_STATIC_NAME = 'static-v1';
let CACHE_DYNAMIC_NAME = 'dynamic-v2';
let STATIC_FILES = [
    '/',
    './index.html',
    '/index.html',
    './src/js/app.js',
    './src/js/idb.js',
    './src/js/promise.js',
    './src/js/fetch.js',
    './src/css/app.css',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css'
]

self.addEventListener('install', (event) => {
    event.waitUntil(install());
})

const install = async () => {
    const cache = await caches.open(CACHE_STATIC_NAME);
    return cache.addAll(STATIC_FILES);
}

self.addEventListener('activate', (event) => {
    event.waitUntil(activate());
})

const activate = async () => {
    const keyList = await caches.keys();
    return Promise.all(keyList.map((key) => {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            return caches.delete(key);
        }
    }));
}

const isInArray = (string, array) => {
    for(let i = 0; i < array.length; i++) {
        if(array[i] === string) {
            return true;
        }
    }
    return false;
}

self.addEventListener('fetch', (event) => {
    let url = `https://free.currencyconverterapi.com/api/v5/currencies`;
    let ConversionUrl = `https://free.currencyconverterapi.com/api/v5/convert?q=`;

    if(event.request.url.startsWith(url)) {
        event.respondWith(
            fetch(event.request)
            .then((res) => {
                let clonedRes = res.clone();
                clearAllData('currencies')
                .then(() => {
                    return clonedRes.json();
                })
                .then((data) => {
                    let currencies = [];
                    for (let key in data.results){
                        const currency = { id: key, data: data.results[key] };
                        currencies.push(currency);
                    }
                    writeData('currencies', currencies);
                })
                return res;
            })
        );
    } else if (event.request.url.startsWith(ConversionUrl)) {
        event.respondWith(
            fetch(event.request)
                .then((res) => {
                    let clonedRes = res.clone();
                    clearAllData('exchangeRates')
                      .then(() => {
                        return clonedRes.json();
                      })
                      .then(data => {
                        let rates = [];
                        console.log('data', data);
                        for (let key in data.results) {
                          console.log('key:', key);
                          const rate = { id: key, data: data.results[key] };
                          rates.push(rate);
                        }
                        writeData('exchangeRates', rates);
                      });
                    return res;
                })
        );
    } else if(isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
            .then((res) => {
                if (res) {
                    return res;
                } else {
                    return fetch(event.request)
                    .then((response) => {
                        return caches.open(CACHE_DYNAMIC_NAME)
                        .then((cache) => {
                            cache.put(event.request.url, response.clone());
                            return reponse;
                        })
                    })
                    .catch((err) => {
                        return caches.open(CACHE_STATIC_NAME)
                        .then((cache) => {
                            if(event.request.headers.get('accept').includes('text/html')) {
                                return cache.match('/offline.html');
                            }
                        })
                    })
                }
            })
        )
    }
    
})

