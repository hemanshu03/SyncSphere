var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.on('disconnect', function () {
    alert("Uh-oh, seems like the server is having some bad time.\nWe got disconnected.. 🥲");
})

function hashPassword(password) {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(password);
    return shaObj.getHash("HEX");
}

function checkForm() {
    var requiredInputs = document.querySelectorAll('input[required]');

    var formIsValid = true;

    requiredInputs.forEach(function (input) {
        if (input.value.trim() === '') {
            formIsValid = false;
        }
    });

    if (!formIsValid) {
        alert('Please fill in all the required fields');
    }

    return formIsValid;
}

function get_fp() {
    var fingerprint = {};

    // User agent
    fingerprint.userAgent = navigator.userAgent;

    // Screen resolution
    fingerprint.screenResolution = screen.width + "x" + screen.height;

    // Timezone offset
    fingerprint.timezoneOffset = new Date().getTimezoneOffset();

    // Language
    fingerprint.language = navigator.language;

    // Plugins
    fingerprint.plugins = Array.prototype.map.call(navigator.plugins, function (p) { return p.name; });

    // Fonts
    var fonts = Array.prototype.map.call(document.fonts, function (f) { return f.family; });
    fingerprint.fonts = fonts.join(',');

    // Canvas fingerprinting (optional)
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    var hash = gl && gl.getParameter(gl.VERSION) + gl.getParameter(gl.RENDERER);
    fingerprint.canvasHash = hash;

    // Additional data can be collected as per requirements

    // Convert fingerprint object to JSON
    var fingerprintJSON = JSON.stringify(fingerprint);

    // Send fingerprint data to server (you would typically use AJAX or fetch)
    // Replace 'YOUR_SERVER_ENDPOINT' with your actual server endpoint
    return fingerprintJSON
}

function ced() {
    var fin_prt = get_fp();
    var userid = document.getElementById('username').value;
    var pass__ = document.getElementById('password').value;
    var captcha_r = document.getElementById('captcha').value;

    pass__ = hashPassword(pass__);

    if (checkForm()) {
        fetch('/check_entered_details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                uid: userid,
                pass__: pass__,
                captcha: captcha_r,
                client_fingerprint: fin_prt
            })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                handleResponse(data);
            })
            .catch(error => {
                alert('Error:', error);
            });
    }
    else {
        alert('Please fill in all the required fields');
    }
}

function handleResponse(response) {
    var userid = document.getElementById('username').value;
    if (response && response.error !== undefined) {
        switch (response.error) {
            case 0:
                alert('Invalid username. Please try again.');
                break;
            case 1:
                alert('Incorrect Password. Try again.');
                break;
            case 5:
                refreshCaptcha()
                alert('Incorrect captcha. Please try again.');
                break;
            case 2:
                break;
            case 10:
                alert('Invalid keys response. (INTERNAL SERVER ERROR)');
                break;
            default:
                alert('Unknown error');
                break;
        }
    }
    if (response && response.url !== undefined) {
        localStorage.setItem('user', userid);
        window.location.href = response.url;
    }
}

function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}

function refreshCaptcha() {
    fetch('/get_new_captcha', {
        method: 'GET'
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function (data) {
            document.getElementById('captchaImage').src = "data:image/png;base64," + data.new_captcha;
            document.getElementById('captcha').value = "";
        })
        .catch(function (error) {
            console.error('Error fetching captcha:', error);
        });
}

function forgot_password() {
    window.location.href = '/redirect/forgot_password';
}

function areCookiesEnabled() {
    localStorage.clear();
    sessionStorage.clear();
    fetch('/check_auth')
        .then(response => {
            if (!response.ok) {
                window.location.href = '/cookie_error';
            }
            // If the session_id exists, the response will be None (which might be interpreted as null in JavaScript)
            if (response.status === 204) {
                console.log("All checks ok. Proceed.");
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}