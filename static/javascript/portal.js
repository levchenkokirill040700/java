function slide(id, parameter='width', size=20) {
    if (isOpen(id, parameter, size)) {
        closeNav(id, parameter);
    } else {
        openNav(id, parameter, size);
    }
}

function isOpen(id, parameter, size) {
    if (document.getElementById(id).style[parameter] === `${size}px`) {
        return true;
    }

    return false;
}

function openNav(id, parameter, size) {
    document.getElementById(id).style[parameter] = `${size}px`;
}

function closeNav(id, parameter) {
    document.getElementById(id).style[parameter] = 0;
}
