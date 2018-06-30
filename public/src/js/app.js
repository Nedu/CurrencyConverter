const url = `https://free.currencyconverterapi.com/api/v5`;

window.onload = () => {
    let fromCurrency = document.getElementById('fromCurrency');
    let toCurrency = document.getElementById('toCurrency');
    let currencyAmount = document.getElementById('currencyAmount');
    let convertedCurrency = document.getElementById('convertedCurrency');
    let convertCurrency = document.getElementById('submitForm');
    convertCurrency.addEventListener('submit', convertCurrencies);
    populateCurrencies();
}

// fetch list of currencies from the api
async function getCurrencies () {
    const res = await fetch(`${url}/currencies`);
    const data = await res.json();
    return Object.keys(data.results);
}

// populate the select elements with the list of currencies fetched
async function populateCurrencies () {
    const results = await getCurrencies();
    results.sort();
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
    
    const res = await fetch(`${url}/convert?q=${query}`);
    const data = await res.json();

    convertedCurrency.value = (data.results[`${currencyFrom}_${currencyTo}`].val * Number(amount)).toFixed(3);
}
