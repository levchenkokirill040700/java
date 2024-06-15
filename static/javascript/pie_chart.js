function makeChart(transactions) {
    const series = [];
    const labels = [];
    let other = 0;

    const total = transactions.reduce((value, t) => {
        return value + toNumber(t.summary.current_value);
    }, 0);

    for (const t of transactions) {
        const value = toNumber(t.summary.current_value);

        if (value < 0.1) continue;

        if ((value / total) <= 0.05) {
            other += value;
            continue;
        }

        series.push(value);
        labels.push(t.summary.symbol.toUpperCase());
    }

    if (other > 0) {
        series.push(other);
        labels.push('Other');
    }

    var options = {
        chart: {
            width: '100%',
            type: 'donut',
        },
        series,
        labels,
        legend: {
            show: true,
            position: 'bottom'
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            pie:{
                donut: {
                    background: 'white',
                    size: '50%',
                    labels: {
                        show: true,
                        value: {
                            formatter: (val) => toCurrency(val)
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            color: 'black',
                            formatter: (w) => formatTotal(w)
                        }
                    }
                }
            }
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    };

    const chart = new ApexCharts(document.querySelector("#pie_chart"), options);
    chart.render();
};

function formatTotal(w) {
    const t = w.globals.seriesTotals.reduce((a, b) => {
        return a + b
    }, 0);

    return toCurrency(t);
}

function toCurrency(value) {
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function toNumber(value) {
    return Number.parseFloat(value.replace(/[^0-9.]/g, ''));
}