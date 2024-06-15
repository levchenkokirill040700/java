$(document).ready(() => {
    $('#notes_table').DataTable({
        searching: true,
        pageLength: 25,
        lengthChange: false,
        columns: [
            { orderable: true, searchable: true },
            { orderable: true, searchable: true },
            { orderable: true, searchable: true },
            { orderable: false, searchable: false }
        ]
    });
});

