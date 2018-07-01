const url = `https://free.currencyconverterapi.com/api/v5`;
let networkDataReceived = false;

if(!window.Promise) {
    window.Promise = Promise;
}

window.onload = () => {
    let fromCurrency = document.getElementById('fromCurrency');
    let toCurrency = document.getElementById('toCurrency');
    let currencyAmount = document.getElementById('currencyAmount');
    let convertedCurrency = document.getElementById('convertedCurrency');
    let convertCurrency = document.getElementById('submitForm');
    
    convertCurrency.addEventListener('submit', convertCurrencies);
    
    registerServiceWorker();
    populateCurrencies();
}

// register service worker
const registerServiceWorker =  async () => {
    if ('serviceWorker' in navigator) {
            navigator.serviceWorker
            .register('/sw.js')
            .then(() => {
                console.log('Service worker registered!');
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        console.log('Your browser does not support Service Worker.');
    }
}

// fetch list of currencies from the api
async function getCurrencies () {
    const res = await fetch(`${url}/currencies`).catch(() => {
        // fetch from indexedDB 
        if ('indexedDB' in window) {
            readAllData('currencies')
                .then(function (data) {
                    const currencies = [];
                    for (let value in data) {
                        const currency = value.data.id;
                        currencies.push(currency);
                    }
                    // if (!networkDataReceived) {
                    console.log('idb: ', currencies);
                    return currencies;
                    // }
                });
        }
    });
    const data = await res.json().catch(() => {
        // fetch from indexedDB 
        if ('indexedDB' in window) {
            readAllData('currencies')
                .then((data) => {
                    // if (!networkDataReceived) {
                        return data;
                    // }
                });
        }
    });
    console.log(data);
    networkDataReceived = true;

    return Object.keys(data.results);
}

// populate the select elements with the list of currencies fetched
async function populateCurrencies () {
    const results = await getCurrencies();
    results.sort();
    console.log('results', results);
    for(index in results) {
        fromCurrency.options[fromCurrency.options.length] = new Option(results[index], results[index]);
        toCurrency.options[toCurrency.options.length] = new Option(results[index], results[index]);
    }
}

// fetch the exchange rate and convert currencies
async function convertCurrencies (e) {
    e.preventDefault();

    await populateCurrencies();

    const amount = currencyAmount.value;
    const currencyFrom = fromCurrency.value;
    const currencyTo = toCurrency.value;
    const query = `${currencyFrom}_${currencyTo},${currencyTo}_${currencyFrom}`;
    
    const res = await fetch(`${url}/convert?q=${query}`).catch(() => {
        // fetch from indexedDB 
        if ('indexedDB' in window) {
            readAllData('exchangeRates')
                .then(function (data) {
                    if (!networkDataReceived) {
                        convertedCurrency.value = (data.results[0].exchange_rate * Number(amount)).toFixed(3);
                    }
                });
        }
    });
    const data = await res.json().catch(() => {
        // fetch from indexedDB 
        if ('indexedDB' in window) {
            readAllData('exchangeRates')
                .then(function (data) {
                    if (!networkDataReceived) {
                        convertedCurrency.value = (data.results[0].exchange_rate * Number(amount)).toFixed(3);
                    }
                });
        }
    });;
    console.log('web: ', data);

    convertedCurrency.value = (data.results[`${currencyFrom}_${currencyTo}`].val * Number(amount)).toFixed(3);
}
