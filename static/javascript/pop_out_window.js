function showModal(modalId, modalClose) {
    const modal = document.getElementById(modalId);

    modal.style.display = "block";

    const span = document.getElementsByClassName(modalClose)[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = "none";
        }
    });
}

function showTransactions(modalId, modalClose, transactions, symbol, coinId) {
    const modal = document.getElementById(modalId);

    const dataId = document.getElementById('trans_table');
    const titleId = document.getElementById('table_title');

    const headers = [
        'Date',
        'Exchange',
        'Type',
        'Pool',
        'Number',
        'Price',
        'Total',
        ''
    ];

    const parsed = JSON.parse(transactions);

    const headerRow = headers.map((h) => `<th>${h}</th>`).join('');

    const header = `<tr>${headerRow}</tr>`;

    const tableRows = parsed.reduce((row, data) => {
        const tData = data.slice(0, 7).map((d) => `<td>${d}</td>`);
        const delLink = `<td><a href="/transactions/${data[data.length - 1]}/delete">del</a></td>`;

        tData.push(delLink);

        row.push(tData.join(''));

        return row;
    }, []).map((r) => `<tr>${r}</tr>`).join('');

    
    const table = `<table class="pure-table" id="details_table"><thead>${header}</thead><tbody>${tableRows}</tbody></table>`;

    titleId.innerHTML = `<a href="/crypto/coin/${coinId}">${symbol.toUpperCase()} Transactions</a>`;
    dataId.innerHTML = table;

    $('#details_table').DataTable({
        searching: true,
        pageLength: 10,
        lengthChange: false,
        order: [[0, 'desc']],
        columns: [
            { orderable: true, searchable: false },
            { orderable: true, searchable: true },
            { orderable: true, searchable: true },
            { orderable: true, searchable: true },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: false, searchable: false },
        ]
    });

    modal.style.display = "block";

    const span = document.getElementsByClassName(modalClose)[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = "none";
        }
    });
}
