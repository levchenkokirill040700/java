$(document).ready(() => {
    $('#exchange_table').DataTable({
        searching: true,
        pageLength: 10,
        lengthChange: false,
        order: [[ 1, "desc" ]],
        columns: [
            { orderable: true, searchable: true },
            { orderable: true, searchable: false },
            { orderable: true, searchable: true }
        ]
    });
});

