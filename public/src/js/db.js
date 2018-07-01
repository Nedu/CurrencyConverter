const dbPromise = idb.open('converter-store', 1, function (db) {
    if (!db.objectStoreNames.contains('currencies')) {
        const currencyIndex = db.createObjectStore('currencies', { keyPath: 'id' });
        currencyIndex.createIndex("id", "id");

    }
    if (!db.objectStoreNames.contains('exchangeRates')) {
        const rateIndex = db.createObjectStore('exchangeRates', { keyPath: 'id' });
        rateIndex.createIndex("id", "id");
    }
});

let writeData = (st, data) => {
    return dbPromise
    .then((db) => {
        let tx = db.transaction(st, 'readwrite');
        let store = tx.objectStore(st);
        for(let i = 0; i < data.length; i++) {
            store.put(data[i]);
        }
        return tx.complete;
    })
}

let readAllData = (st) => {
    return dbPromise
    .then((db) => {
        let tx = db.transaction(st, 'readonly');
        let index = tx.objectStore(st).index("id");
        let store = tx.objectStore(st);
        return store.getAll();
    })
}

let clearAllData = (st) => {
    return dbPromise
    .then((db) => {
        let tx = db.transaction(st, 'readwrite');
        let store = tx.objectStore(st);
        store.clear();
        return tx.complete;
    })
}