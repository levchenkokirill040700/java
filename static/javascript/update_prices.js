'use strict';

function eternalUpdate() {
    setInterval(() => getPrices(), 180000);
}

function getPrices() {
    $.get("/crypto/cached_markets", (res, status) => {
        if (status === 'success') {
            updatePrices(res.data);
            document.getElementById('cached_time').innerText = res.cache_time.toISOString();
        }
    });
}

function updatePrices(data) {
    for (const d of data) {
        const newPrice = d.price;
        const priceElement = document.getElementById(`${d.symbol}_price`);

        if (priceElement) {
            const currentPrice = priceElement.innerText.slice(1, 100).split(',').join('');

            const priceChange = evalPrice(newPrice, currentPrice);
            
            priceElement.classList.remove('priceHigher', 'priceLower');
            
            if (priceChange === 'higher') {
                priceElement.classList.add('priceHigher');
            }
            
            if (priceChange === 'lower') {
                priceElement.classList.add('priceLower');
            }
            
            priceElement.innerText = asCurrency(d.price);
            
            document.getElementById(`${d.symbol}_dper`).innerText = toFixed(d.change_per);
        }
    }
}

function evalPrice(n1, n2) {
    const num1 = Number.parseFloat(n1, 10);
    const num2 = Number.parseFloat(n2, 10);

    if(num1 > num2) return 'higher';

    if (num1 < num2) return 'lower';

    return 'equal';
}

function asCurrency(value) {
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD'});
}

function toFixed(value, num = 4) {
    return Number(value).toFixed(num)
}