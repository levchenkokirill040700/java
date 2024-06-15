$(document).ready(() => {
    $('#transactions_table').DataTable({
        searching: true,
        pageLength: 20,
        lengthChange: false,
        order: [],
        columns: [
            { orderable: true, searchable: true },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: true, searchable: false },
            { orderable: false, searchable: false }
        ]
    });
});
