const url = `https://free.currencyconverterapi.com/api/v5`;

window.onload = () => {
    let fromCurrency = document.getElementById('fromCurrency');
    let toCurrency = document.getElementById('toCurrency');
    populateCurrencies();
}

async function getCurrencies () {
    const res = await fetch(`${url}/currencies`);
    const data = await res.json();
    return Object.keys(data.results);
}

async function populateCurrencies () {
    const results = await getCurrencies();
    results.sort();
    for(index in results) {
        fromCurrency.options[fromCurrency.options.length] = new Option(results[index], index);
        toCurrency.options[toCurrency.options.length] = new Option(results[index], index);
    }
}
