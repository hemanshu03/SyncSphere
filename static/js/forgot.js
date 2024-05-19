var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
var spinner = null;

socket.on('redirect', function (data) {
    window.location.href = data.url;
});

const validDomains = {
    'gmail.com': true,
    'yahoo.org': true,
    'rediffmail.com': true,
    'mitwpu.edu.in': true,
};

function validateEmail() {
    var email = document.getElementById('email-full').value
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email-id.");
    }
    const [, domain] = email.split('@');
    if (validDomains[domain] === true) {
        sessionStorage.setItem('email', email);
        showLoadingAnimation();
        check_email(email);
    }
}

socket.on('validation_result', function (data) {
    if (data.result === 'incorrect') {
        alert(data.error || 'Incorrect Captcha. Please try again.');
        hideLoadingAnimation();
        refreshCaptcha();
    }
});

function hashPassword(password) {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(password);
    return shaObj.getHash("HEX");
}

function checkUsername() {
    var username = document.getElementById("username").value;
    socket.emit('check_username', { username: username });
    document.querySelector("#initial-form button").disabled = true;
    return false;
}

socket.on('usnm_verification_status', function (data) {
    document.querySelector("#initial-form button").disabled = false;
    if (data.exists) {
        var username = document.getElementById('username').value;
        sessionStorage.setItem('username', username);
        Email_veriForm();
    } else {
        alert("Username does not exist. Please try again.");
    }
});

function Email_veriForm() {
    var initialForm = document.getElementById('initial-form');
    var emailForm = document.getElementById('email-form');
    if (initialForm && emailForm) {
        initialForm.style.display = 'none';
        emailForm.style.display = 'block';

        var usernameInput = document.getElementById('username-full');

        if (usernameInput) {
            usernameInput.value = sessionStorage.getItem('username');;
        }
    }
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

function sendOtp(email) {
    socket.emit('send_otp', { email: email, for_type: 'update_pass'});
    loadOtpVerificationForm();
}

function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    }
}

function loadOtpVerificationForm() {
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
    var sessionID = sessionStorage.getItem("session_id", "{{ session_id }}");

    fetch('/get_new_captcha', {
        method: 'GET',
        headers: {
            'X-Session-ID': sessionID
        }
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

function loadFullRegistrationForm() {
    var initialForm = document.getElementById('initial-form');
    var otpForm = document.getElementById('otp-veri');
    var emailForm = document.getElementById('email-form')
    if (otpForm) {
        otpForm.style.display = 'none';
    }
    if (initialForm) {
        initialForm.style.display = 'none';
    }
    if (emailForm) {
        emailForm.style.display = 'none';
    }
    var fullRegistrationForm = document.getElementById('v-full-registration-form');
    if (fullRegistrationForm) {
        fullRegistrationForm.style.display = 'block';
        var usernameInput = document.getElementById('username-full_');
        var emailInput = document.getElementById('email-full_');
        if (usernameInput && emailInput) {
            usernameInput.value = sessionStorage.getItem('username');
            emailInput.value = sessionStorage.getItem('email');
        }
    }
}

function check_email(email){
    var username = sessionStorage.getItem('username', username);
    socket.emit('check_email', {urnm: username, email__: email});
}

socket.on('email_status', function (data) {
    if (data.incorrect) {
        hideLoadingAnimation();
        alert('Invalid Email ID. Please enter email registered for your account.');
    }
    if (!data.incorrect) {
        hideLoadingAnimation();
        sendOtp(sessionStorage.getItem('email'));
    }
})

function validateForm() {
    var username = document.getElementById("username-full_").value;
    var email = document.getElementById("email-full_").value;
    var password = document.getElementById("password").value;
    var captcha_r = document.getElementById("captcha").value;

    password = hashPassword(password);

    showLoadingAnimation();
    socket.emit('update_password', { usr: username, eml: email, psrd: password, captcha_: captcha_r });
}

function notify_user() {
    // Stop loading animation
    hideLoadingAnimation();
}

function hideLoadingAnimation() {
    if (spinner !== null) {
        spinner.stop();
    }
}

function showLoadingAnimation() {
    var target = document.getElementById('loading-spinner');
    var opts = {
        lines: 13, // The number of lines to draw
        length: 28, // The length of each line
        width: 14, // The line thickness
        radius: 42, // The radius of the inner circle
        scale: 1, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#ffffff', // CSS color or array of colors
        fadeColor: 'transparent', // CSS color or array of colors
        speed: 1, // Rounds per second
        rotate: 0, // The rotation offset
        animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
        direction: 1, // 1: clockwise, -1: counterclockwise
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        className: 'spinner', // The CSS class to assign to the spinner
        top: '50%', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: '0 0 1px transparent', // Box-shadow for the lines
        position: 'absolute' // Element positioning
    };
    spinner = new Spinner(opts).spin(target);
}

socket.on('invalid_session', function (data) {
    if (data.invalid_session) {
        alert('Server reported this session ID is invalid. Please start over.');
        socket.emit('redirect_to_landing____');
    }
})

function clear_browser() {
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.sessionStorage.clear();
    window.localStorage.clear();
}

socket.on('updation_status', function (data) {
    if (data.isfailed) {
        alert('Sent data was not valid. Please try again by repeating the process.');
        socket.on('redirect_to_landing____');
    }
    if (!data.isfailed) {
        alert('Your password was updated successfully!');
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

socket.on('otp_verification', function (data) {
    if (!data.result && !data.error) {
        alert('E-mail ID could not be verified. Wrong OTP entered.');
        socket.emit('redirect_to_landing____');
    }
    if (!data.result && data.error) {
        alert('Some error occured. Please try again.');
        socket.emit('redirect_to_landing____');
    }
    if (data.result && !data.error) {
        alert('E-mail ID verified successfully!');
        loadFullRegistrationForm();
    }
});

