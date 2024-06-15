$(document).ready( function () {
    $('#sorted_table').DataTable({
        searching: false,
        pageLength: 20,
        lengthChange: false
    });
});

[
    'page_table',
    'visit_table',
    'browser_table',
    'os_table',
    'country_table'
].forEach((table) => {
    $(document).ready( function () {
        $(`#${table}`).DataTable({
            searching: false,
            pageLength: 10,
            lengthChange: false
        });
    });
});
