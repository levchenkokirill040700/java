function preview() {
    const rawMarkDown =  marked.parse(document.getElementById('note_content').value);
    document.getElementById('preview_content').innerHTML = DOMPurify.sanitize(rawMarkDown);
}
