$(document).ready( function () {
    $('#rating_table').DataTable({
        searching: false,
        pageLength: 20,
        lengthChange: false,
        "columns": [
            { "orderable": true },
            { "orderable": true },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false }
        ]
    });
});

$(document).ready( function () {
    $('#write_up_table').DataTable({
        searching: false,
        pageLength: 10,
        lengthChange: false,
        "columns": [
            { "orderable": true },
            { "orderable": true },
            { "orderable": false },
            { "orderable": false },
            { "orderable": false }
        ]
    });
});