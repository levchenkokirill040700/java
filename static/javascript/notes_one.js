function showHide(showId, hideId) {
    const hideDiv = document.getElementById(hideId);
    const showDiv = document.getElementById(showId);

    hideDiv.style.display = 'none';
    showDiv.style.display = 'block';
}
