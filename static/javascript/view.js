function passCheck() {
    if (document.getElementById('new_password').value ==
        document.getElementById('confirm_password').value) {
        document.getElementById('message').style.color = 'green';
        document.getElementById('message').innerHTML = 'matching';
        document.getElementById('submit').disabled = false;
    } else {
        document.getElementById('message').style.color = 'red';
        document.getElementById('message').innerHTML = 'not matching';
        document.getElementById('submit').disabled = true;  
    }
}

function passResetM() {    
    const passM = document.getElementById('resetM').innerHTML;

    if (passM === 'password reset successfully') {
        document.getElementById('resetM').style.color = 'green';
    } else {
        document.getElementById('resetM').style.color = 'red';
    }
}