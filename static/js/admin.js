
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

function hashPassword(password) {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(password);
    return shaObj.getHash("HEX");
}

function get_session() {
    // Create a URL object
    var url = window.location.href;

    // Extract the session_id parameter from the URL
    var sessionIdIndex = url.indexOf("session_id%3F=");

    if (sessionIdIndex !== -1) {
        // Adjust the index to get the actual value
        sessionIdIndex += "session_id%3F=".length;

        // Find the end index of the session ID
        var endIndex = url.indexOf("&", sessionIdIndex);
        if (endIndex === -1) {
            endIndex = url.length;
        }

        // Extract the session ID
        var sessionId = url.substring(sessionIdIndex, endIndex);

        // Decode the session ID if needed
        sessionId = decodeURIComponent(sessionId);
    }
    return sessionId
}

function sendOtp() {
    var sessionId = get_session();

    console.log('Session ID: ' + sessionId)

    socket.emit('send_otp', { email: email, session_id: sessionId });
    loadOtpVerificationForm()
}

function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    }
}

function loadOtpVerificationForm() {
    //console.log('Inside the loadOtpVerificationForm Function')
    var initialForm = document.getElementById('initial-form');
    var otpForm = document.getElementById('otp-veri');

    if (initialForm && otpForm) {
        initialForm.style.display = 'none';
        otpForm.style.display = 'block';

        var usernameInput = document.getElementById('username-full');
        var emailInput = document.getElementById('email-full');

        if (usernameInput) {
            usernameInput.value = sessionStorage.getItem('username');
        }

        if (emailInput) {
            emailInput.value = sessionStorage.getItem('email');
        }
    }
}

function refreshCaptcha() {
    var xhr = new XMLHttpRequest();
    var sessionID = get_session()
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            document.getElementById('captchaImage').src = "data:image/png;base64," + response.dbe47c7be62528bccda2a24770abebb06462b9ecb01976929932305edd7cdafd;
            document.getElementById('captcha').value = "";
        }
    };
    xhr.open('GET', '/ebceed68117677823766ed1df08063bda5af1a2fa4ad6708130cefba040b3f06', true);
    xhr.setRequestHeader('X-Session-ID', sessionID);
    xhr.send();
}

function validateForm() {
    var username = document.getElementById("username-full").value;
    var email = document.getElementById("email-full").value;
    var password = document.getElementById("password").value;
    var sessionID = get_session();

    password = hashPassword(password);

    socket.emit('a35e47a2508872afcfc43e0d0dc9e29b6d5bffae02daab9afa00cec23bc843e5', { usr: username, eml: email, psrd: password, session_id: sessionID });
}

socket.on('invalid_session', function (data) {
    if (data.invalid_session) {
        alert('Server reported this session ID is invalid. Please start over.');
        socket.emit('redirect_to_landing____');
    }
})

socket.on('redirect', function (data) {
    // Redirect to the specified URL
    window.location.href = data.url;
});

socket.on('registration_status', function (data) {
    if (data.isfailed) {
        alert('Sent data was not valid. Please try again by repeating the process.');
        socket.on('redirect_to_landing____');
    }
    if (!data.isfailed) {
        var username = document.getElementById('username-full_').value;
        alert('Your account has been registered successfully!');
        var sessionID = get_session()
        socket.emit('redirect_to_landing_Reg_s____', { sessionID: sessionID, usr: username });
        window.location.href = '/';
    }
});

socket.on('redirect', function (data) {
    window.location.href = data.url;
});

function validateOtp() {
    var otpValue = document.getElementById('otp__').value;
    var session_id = get_session()
    socket.emit('validate_otp', { otp: otpValue, session_id: session_id });
}

