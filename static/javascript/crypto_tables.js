$(document).ready(() => {
    $('#market_table').DataTable({
        searching: true,
        pageLength: 50,
        lengthChange: false,
        columns: [
            { orderable: true, searchable: false },
            { orderable: true },
            { orderable: true, searchable: false },
            { orderable: false, searchable: true },
            { orderable: true, searchable: false }
        ]
    });
});

