function toggleClassDisplay(args1, args2) {
    const class1Div = document.getElementById(args1.id);
    const class2Div = document.getElementById(args2.id);

    if (hidden(args1.id)) {
        class1Div.style.display = args1.display;
        class2Div.style.display = 'none';
    } else {
        class2Div.style.display = args2.display;
        class1Div.style.display = 'none';
    }
}

function viewHideClass(classId) {
   const classDiv = document.getElementById(classId);

    if (hidden(classId)) {
        classDiv.style.display = "block";
    } else {
        classDiv.style.display = 'none';
    }

}

function hidden(id) {
    const { display } = document.getElementById(id).style;

    if (display == null || display === 'none' || display === '') {
        return true;
    }

    return false;
}

function viewHideRows(classId, linkId) {
    const classDiv = document.getElementsByClassName(classId);
    const byId = document.getElementById(linkId);

    if (hiddenClass(classId)) {
        byId.innerHTML = '-';
        for (const c of classDiv) {
            c.style.display = "table-row";
        }
    } else {
        byId.innerHTML = '+';
        for (const c of classDiv) {
            c.style.display = 'none';
        }
    }

}

function hiddenClass(id) {
    const { display } = document.getElementsByClassName(id)[0].style;

    if (display == null || display === 'none' || display === '') {
        return true;
    }

    return false;
}