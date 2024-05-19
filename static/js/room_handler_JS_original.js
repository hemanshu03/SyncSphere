const socket = io.connect('https://' + document.domain + ':' + location.port);
socket.emit("Check_SID_Validity");
socket.emit('join_room_manual');

var server_connection = true;

function keyExists(key) {
    return localStorage.getItem(key) !== null;
}

const scroll_to_top = function (event) {
    event.preventDefault();
    const messageBox = document.getElementById('message-box');
    const button = document.getElementById('top-it-up');

    if (messageBox.scrollTop === 0) {
        button.title = 'Scroll to bottom';
    } else {
        button.title = 'Scroll to top';
    }

    const targetScrollTop = (messageBox.scrollTop === 0) ? messageBox.scrollHeight : 0;

    messageBox.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
    });
}

const messageBox = document.getElementById('message-box');
messageBox.addEventListener('scroll', function () {
    const button = document.getElementById('top-it-up');
    if (messageBox.scrollTop === 0) {
        button.title = 'Scroll to bottom';
        button.textContent = '↓';
    } else {
        button.title = 'Scroll to top';
        button.textContent = '↑'
    }
});

check_if_password_entered();

const storedKeyString = localStorage.getItem('key');
const storedKeyArray = storedKeyString.split(',').map(Number);
const storedKey = new Uint8Array(storedKeyArray);

let room_code;
var files_flag = 0;
var dropdownContent = document.getElementById("languageDropdown");

const upload_butt = document.getElementById('upload-button--');

window.onload = async function () {
    store_creds();
}

var languages = [
    "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali",
    "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chichewa", "Chinese (Simplified)", "Chinese (Traditional)",
    "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Filipino", "Finnish",
    "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian",
    "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese",
    "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Korean", "Kurdish (Kurmanji)", "Kyrgyz", "Lao", "Latin", "Latvian",
    "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi",
    "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi",
    "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak",
    "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tajik", "Tamil", "Telugu", "Thai", "Turkish",
    "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"
];

function check_if_password_entered() {
    if (keyExists('key')) {
        user_in_LS = localStorage.getItem('user');
        if (user_in_LS === null || user_in_LS === 'None' || user_in_LS === 'none') {
            window.location.href = '/login'
        }
    }
    else {
        window.location.href = '/rooms'
    }
}

var languageCodes = {
    "Afrikaans": "af",
    "Albanian": "sq",
    "Amharic": "am",
    "Arabic": "ar",
    "Armenian": "hy",
    "Azerbaijani": "az",
    "Basque": "eu",
    "Belarusian": "be",
    "Bengali": "bn",
    "Bosnian": "bs",
    "Bulgarian": "bg",
    "Catalan": "ca",
    "Cebuano": "ceb",
    "Chichewa": "ny",
    "Chinese (Simplified)": "zh-CN",
    "Chinese (Traditional)": "zh-TW",
    "Corsican": "co",
    "Croatian": "hr",
    "Czech": "cs",
    "Danish": "da",
    "Dutch": "nl",
    "English": "en",
    "Esperanto": "eo",
    "Estonian": "et",
    "Filipino": "tl",
    "Finnish": "fi",
    "French": "fr",
    "Frisian": "fy",
    "Galician": "gl",
    "Georgian": "ka",
    "German": "de",
    "Greek": "el",
    "Gujarati": "gu",
    "Haitian Creole": "ht",
    "Hausa": "ha",
    "Hawaiian": "haw",
    "Hebrew": "he",
    "Hindi": "hi",
    "Hmong": "hmn",
    "Hungarian": "hu",
    "Icelandic": "is",
    "Igbo": "ig",
    "Indonesian": "id",
    "Irish": "ga",
    "Italian": "it",
    "Japanese": "ja",
    "Javanese": "jv",
    "Kannada": "kn",
    "Kazakh": "kk",
    "Khmer": "km",
    "Kinyarwanda": "rw",
    "Korean": "ko",
    "Kurdish (Kurmanji)": "ku",
    "Kyrgyz": "ky",
    "Lao": "lo",
    "Latin": "la",
    "Latvian": "lv",
    "Lithuanian": "lt",
    "Luxembourgish": "lb",
    "Macedonian": "mk",
    "Malagasy": "mg",
    "Malay": "ms",
    "Malayalam": "ml",
    "Maltese": "mt",
    "Maori": "mi",
    "Marathi": "mr",
    "Mongolian": "mn",
    "Myanmar (Burmese)": "my",
    "Nepali": "ne",
    "Norwegian": "no",
    "Pashto": "ps",
    "Persian": "fa",
    "Polish": "pl",
    "Portuguese": "pt",
    "Punjabi": "pa",
    "Romanian": "ro",
    "Russian": "ru",
    "Samoan": "sm",
    "Scots Gaelic": "gd",
    "Serbian": "sr",
    "Sesotho": "st",
    "Shona": "sn",
    "Sindhi": "sd",
    "Sinhala": "si",
    "Slovak": "sk",
    "Slovenian": "sl",
    "Somali": "so",
    "Spanish": "es",
    "Sundanese": "su",
    "Swahili": "sw",
    "Swedish": "sv",
    "Tajik": "tg",
    "Tamil": "ta",
    "Telugu": "te",
    "Thai": "th",
    "Turkish": "tr",
    "Ukrainian": "uk",
    "Urdu": "ur",
    "Uzbek": "uz",
    "Vietnamese": "vi",
    "Welsh": "cy",
    "Xhosa": "xh",
    "Yiddish": "yi",
    "Yoruba": "yo",
    "Zulu": "zu"
};

function filterLanguages() {
    var input, filter, a, i;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    for (i = 0; i < languages.length; i++) {
        a = dropdownContent.children[i];
        if (a.textContent.toUpperCase().indexOf(filter) > -1) {
            a.style.display = "";
        } else {
            a.style.display = "none";
        }
    }
}

function set_button(button) {
    sessionStorage.setItem('button_translate', button.closest('.message-container').id);
    toggleDropdown();
}

function populateDropdown() {
    for (var i = 0; i < languages.length; i++) {
        var a = document.createElement("a");
        a.textContent = languages[i];
        a.addEventListener("click", selectLanguage.bind(null, languages[i]));
        dropdownContent.appendChild(a);
    }
}

function toggleDropdown() {
    openPopup();
    var dropdown = document.getElementById("languageDropdown");
    populateDropdown();
    dropdown.classList.toggle("show");
}

function selectLanguage(language) {
    var code = languageCodes[language];
    translate_text(code, language);
    closePopup();
}

localStorage.setItem('hideConfirmation', 'false');

function openPopup() {
    document.getElementById('languagePopup').style.display = 'block';
}

function closePopup() {
    toggleDropdown();
    document.getElementById('languagePopup').style.display = 'none';
}

async function translate_text(code, language) {
    showLoadingAnimation();
    var messageDiv = sessionStorage.getItem('button_translate');
    messageDiv = document.getElementById(messageDiv);
    var user_name = localStorage.getItem('user');
    const userName = messageDiv.querySelector('.user_name').textContent.trim();
    if (messageDiv) {
        const textContent = messageDiv.querySelector('.msg').textContent.trim();

        const endpoint = '/translate_api';
        const data = {
            text_to_translate: textContent,
            target_language: code
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(endpoint, options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const translatedData = await response.json();

            console.log("Translated data: ", translatedData);

            // Create a new element to display translated text
            const translatedDiv = document.createElement('div');
            if (userName == user_name || userName == 'You') {
                translatedDiv.classList.add('translated-message-current');
                translatedDiv.innerHTML = `
                <div class="message-current-translate">
                    <label style="font-size: small; font-weight: 500; color: #9f9f9f;">Translated message by "${userName}" to "${language}".</label><br>
                    <label class="translated-msg" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">${translatedData.translatedText}</label><br>
                </div>
            `;
            }
            else {
                translatedDiv.classList.add('translated-message-other');
                translatedDiv.innerHTML = `
                <div class="message-other-translate">
                    <label style="font-size: small; font-weight: 500; color: #9f9f9f;">Translated message by "${userName}" to "${language}".</label><br>
                    <label class="translated-msg" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">${translatedData.translatedText}</label><br>
                </div>
            `;
            }
            hideLoadingAnimation();
            messageDiv.appendChild(translatedDiv);

        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.log('Message container not found');
    }
}

function hideLoadingAnimation() {
    if (spinner !== null) {
        spinner.stop();
    }
}

function showLoadingAnimation() {
    var target = document.getElementById('loading-spinner');
    var opts = {
        lines: 13,
        length: 28,
        width: 14,
        radius: 42,
        scale: 1,
        corners: 1,
        color: '#ffffff',
        fadeColor: 'transparent',
        speed: 1,
        rotate: 0,
        animation: 'spinner-line-fade-quick',
        direction: 1,
        zIndex: 2e9,
        className: 'spinner',
        top: '50%',
        left: '50%',
        shadow: '0 0 1px transparent',
        position: 'absolute'
    };
    spinner = new Spinner(opts).spin(target);
}

async function sendMessage() {
    const message = document.getElementById("message-input")
    if (message.value == "") return;
    var en_msg = await aesEncrypt(message.value);
    en_msg = new Uint8Array(en_msg).toString()
    socket.emit("message", { data: en_msg, room_code: localStorage.getItem('room_code') });
    message.value = "";
}

async function aesDecrypt(ciphertext) {
    var encryptedMessageUint8Array = new Uint8Array(ciphertext.split(',').map(Number));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        storedKey,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
    );

    const iv = encryptedMessageUint8Array.slice(0, 16);
    const encryptedData = encryptedMessageUint8Array.slice(16);

    const decryptedData = await crypto.subtle.decrypt(
        {
            name: 'AES-CBC',
            iv: iv
        },
        cryptoKey,
        encryptedData
    );

    return new TextDecoder().decode(decryptedData);
}

async function aesEncrypt(message) {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        storedKey,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
    );

    const encodedMessage = new TextEncoder().encode(message);

    const iv = crypto.getRandomValues(new Uint8Array(16));

    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv: iv
        },
        cryptoKey,
        encodedMessage
    );

    const encryptedBytes = new Uint8Array(iv.length + new Uint8Array(encryptedData).length);
    encryptedBytes.set(iv, 0);
    encryptedBytes.set(new Uint8Array(encryptedData), iv.length);

    return encryptedBytes;
}

window.addEventListener('load', scrollMessageBoxToBottom);

function handleKeyPress(event) {
    const { keyCode, target, shiftKey } = event;
    const isMessageInput = target.id === 'message-input';

    if (keyCode === 13 && isMessageInput) {
        event.preventDefault();
        if (shiftKey) {
            // If shift key is pressed along with enter, insert a new line
            const input = document.getElementById('message-input');
            const startPos = input.selectionStart;
            const endPos = input.selectionEnd;
            const value = input.value;
            input.value = value.substring(0, startPos) + '\n' + value.substring(endPos);
            input.selectionStart = input.selectionEnd = startPos + 1;
        } else {
            // If only enter is pressed, send the message
            sendMessage();
        }
    }
}

function scrollMessageBoxToBottom() {
    const messageBox = document.getElementById('message-box');
    messageBox.scrollTop = messageBox.scrollHeight;
}

document.getElementById('showParticipantsBtn').addEventListener('click', function () {
    document.getElementById('participantModal').style.display = 'block';
});

document.getElementsByClassName('close')[0].addEventListener('click', function () {
    document.getElementById('participantModal').style.display = 'none';
});

/*const update_op = (data) => {
    if (localStorage.getItem('key') !== null) {
        var patiListDiv = document.getElementById('participant-list');
        var downloadSelectedButton = document.getElementById('download-multiple');
        patiListDiv.innerHTML = '';

        files.forEach(file => {
            var fileDiv = document.createElement('div');
            fileDiv.innerHTML = `
                <div id='parti-list' style="display: flex; justify-content: space-between; align-items: center;">
                    <label for='parti-list'>
                        ${file}
                    </label>
                </div>
                `;
            patiListDiv.appendChild(fileDiv);
        });

        downloadSelectedButton.style.display = 'none';
        document.querySelectorAll('.file-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateDownloadButtonVisibility);
        });
        document.getElementById('fileModal').style.display = 'block';
    }
};*/

const delete_msg_event = (button) => {
    const messageDiv = button.closest('.message-container');
    const messageId = messageDiv.id;
    if (shouldAskConfirmation()) {
        deletemsg_confirmation(messageDiv, messageId)
    } else {
        deleteMessage(messageDiv, messageId);
    }

};

const deletefile_confirmation = (file) => {
    // confirmation pop-out division
    const confirmationDiv = document.createElement('div');
    confirmationDiv.classList.add('confirmation-div');

    // confirmation message
    const confirmationMessage = document.createElement('p');
    confirmationMessage.textContent = `Are you sure you want to delete file '${file}' for everyone in this room?`;
    confirmationMessage.id = 'header-text'
    confirmationDiv.appendChild(confirmationMessage);

    // buttons division
    const buttonsDivision = document.createElement('div');
    buttonsDivision.classList.add('buttons_division');

    // confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = "Confirm";
    confirmButton.id = 'confirm-delete-button';
    confirmButton.addEventListener('click', () => {
        deleteFile(file);
        confirmationDiv.remove();
    });
    buttonsDivision.appendChild(confirmButton);

    // cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = "Cancel";
    cancelButton.id = 'cancel-delete-button';
    cancelButton.addEventListener('click', () => {
        // Remove the confirmation pop-out division
        confirmationDiv.remove();
    });
    buttonsDivision.appendChild(cancelButton);

    confirmationDiv.appendChild(buttonsDivision);

    // Append the confirmation pop-out division to the document body
    document.body.appendChild(confirmationDiv);
};

const deletemsg_confirmation = (messageDiv, messageId) => {
    // confirmation pop-out division
    const confirmationDiv = document.createElement('div');
    confirmationDiv.classList.add('confirmation-div');

    // confirmation message
    const confirmationMessage = document.createElement('p');
    confirmationMessage.textContent = "Are you sure you want to delete this message for everyone in this room?";
    confirmationMessage.id = 'header-text'
    confirmationDiv.appendChild(confirmationMessage);

    // buttons division
    const buttonsDivision = document.createElement('div');
    buttonsDivision.classList.add('buttons_division');

    // confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = "Confirm";
    confirmButton.id = 'confirm-delete-button';
    confirmButton.addEventListener('click', () => {
        if (confirmationCheckbox.checked) {
            // If checkbox is checked, update localStorage to remember the choice
            localStorage.setItem('hideConfirmation', 'true');
        }
        deleteMessage(messageDiv, messageId);
        // Remove the confirmation pop-out division
        confirmationDiv.remove();
    });
    buttonsDivision.appendChild(confirmButton);

    // cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = "Cancel";
    cancelButton.id = 'cancel-delete-button';
    cancelButton.addEventListener('click', () => {
        // Remove the confirmation pop-out division
        confirmationDiv.remove();
    });
    buttonsDivision.appendChild(cancelButton);

    confirmationDiv.appendChild(buttonsDivision);

    // checkbox division
    const checkboxDivision = document.createElement('div');
    checkboxDivision.classList.add('checkbox_division');

    // checkbox
    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = "Don't ask again (You can always revert this by refreshing the page)";
    checkboxLabel.id = 'label-confirmation';
    const confirmationCheckbox = document.createElement('input');
    confirmationCheckbox.type = 'checkbox';
    checkboxLabel.appendChild(confirmationCheckbox);
    checkboxDivision.appendChild(checkboxLabel);

    confirmationDiv.appendChild(checkboxDivision);

    // Append the confirmation pop-out division to the document body
    document.body.appendChild(confirmationDiv);
};

const shouldAskConfirmation = () => {
    const hideConfirmation = localStorage.getItem('hideConfirmation');
    if (hideConfirmation === 'true') {
        return false;
    }
    else {
        return true;
    }
};

const deleteMessage = (messageDiv, messageId) => {
    fetch('/delete_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message_id: messageId,
        }),
    })
        .then(response => {
            if (response.ok) {
                // If the deletion is successful, remove the message from the UI
                messageDiv.remove();
            } else {
                // Handle error cases here
                console.error('Failed to delete message');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

const upload = function (formData) {
    var message = "";
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(responseText => {
            // Handle server response
            if (responseText === 'Files uploaded successfully') {
                showPopup(message);
                files_flag = 0;
                showFiles(0);
            } else {
                alert("An error occurred while uploading files.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/*
upload_butt.addEventListener('click', function (event) {
    //const sendFile = function () {
    event.preventDefault();
    //var fileInput = document.querySelector('input[type="file"]');
    var files = fileInput.files;
    let file_ext = '';

    //alert("Number of files: " + fileInput.files.length);

    //alert("fileInput: " + JSON.stringify(fileInput) + "\nfiles: " + JSON.stringify(files));


    if (files.length > 0) {
        var formData = new FormData();
        formData.append('room_code', room_code);

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            file_ext = file.name.split('.').pop().toLowerCase();
            alert("Step 1: ", toString(file_ext));

            fetch('/extension_check', {
                method: 'POST',
                body: file_ext
            })
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                })
                .then(responseText => {
                    if (responseText === 'Not allowed') {
                        alert("'" + toString(file_ext) + "' files are not allowed to be uploaded. Please check file extensions.");
                    } else {
                        alert("Extension was allowed. Handing over...");
                        upload_files(event);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    } else {
        alert("Please select at least one file to upload.");
    }
    fileInput.value = '';
});

const upload_files = function (event) {
    alert("Inside 'upload_files'");
    event.preventDefault();
    //var fileInput = document.querySelector('input[type="file"]');
    var files = fileInput.files;
    var message = "";

    alert("fileInput: " + toString(fileInput) + "\nfiles: " + files);

    if (files.length > 0) {
        var formData = new FormData();
        formData.append('room_code', room_code);

        var i = 0;

        for (i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        if (i > 1) {
            message = "Files uploaded successfully!";
        }
        else {
            message = 'File "' + files[0].name + '" uploaded successfully!';
        }
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    showPopup(message);
                    return response.text();
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(responseText => {
                if (responseText === 'Files uploaded successfully') {
                    files_flag = 0;
                    showFiles();
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    else {
        alert("Please select at least one file to upload.");
    }
    fileInput.value = '';
};
*/

//const upload_butt = document.getElementById('upload-button--');
//const fileInput = document.querySelector('input[type="file"]');
//const room_code = 'your_room_code'; // Define your room code here

upload_butt.addEventListener('click', function (event) {
    showLoadingAnimation();
    event.preventDefault();
    var fileInput = document.querySelector('input[type="file"]');
    var files = fileInput.files;
    var fileExtensions = new FormData(); // Collect all file extensions

    if (files.length > 0) {
        var formData = new FormData();
        formData.append('room_code', room_code);

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileNameParts = file.name.split('.');
            if (fileNameParts.length < 2) {
                alert("File '" + file.name + "' does not have a valid extension. Please check the file name.");
                return; // Exit function if any file has invalid extension
            }
            var file_ext = fileNameParts.pop().toLowerCase();
            fileExtensions.append('file_exts[]', file_ext); // Collect file extension
            formData.append('files[]', file);
        }

        fetch('/extension_check', {
            method: 'POST',
            body: fileExtensions //new URLSearchParams({ file_exts: fileExtensions }) // Send all file extensions to server
        })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Parse JSON response
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(responseData => {
                // Check if all file extensions are allowed
                if (responseData.allowed) {
                    fetch('/upload', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => {
                            if (response.ok) {
                                showPopup("Files uploaded successfully!");
                                showFiles(flag = 0);
                            } else {
                                throw new Error('Network response was not ok.');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                } else {
                    // At least one file extension is not allowed
                    alert("One or more selected files have disallowed extensions. Please check file extensions.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    else {
        alert("Please select at least one file to upload.");
    }
    fileInput.value = '';
    hideLoadingAnimation();
});

// Define your showPopup and showFiles functions if not defined already
function showPopup(message) {
    var popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = message;

    document.body.appendChild(popup);

    setTimeout(function () {
        popup.style.opacity = '0';
        setTimeout(function () {
            document.body.removeChild(popup);
        }, 500);
    }, 3000);
}

const createEnterPop_ = (content) => {
    const line = document.createElement('div');
    line.classList.add('enter-line');

    if (content.name === localStorage.getItem('user')) {
        line.innerHTML = `You ${content.message} ${content.timestamp}`;
        activity_status();
    }
    else {
        line.innerHTML = `"${content.name}" ${content.message} ${content.timestamp}`;
    }
    const messageContainer = document.getElementById('message-box');
    messageContainer.appendChild(line);
};

const createFilePop_ = (content) => {
    const line = document.createElement('div');
    line.classList.add('file-line');
    line.title = "Download this file by clicking on this line";
    line.onclick = () => fetchFile(content.file.replace(/\s/g, '_')); // Corrected onclick assignment

    if (content.name === localStorage.getItem('user')) {
        line.innerHTML = `You ${content.message} "${content.file}" ${content.timestamp}`;
    }
    else {
        line.innerHTML = `"${content.name}" ${content.message} ${content.timestamp}`;
    }
    const messageContainer = document.getElementById('message-box');
    messageContainer.appendChild(line);
};

socket.on('message', function (data) {
    if (data.enter_event == true) {
        createEnterPop_(data);
    }
    if (data.hasOwnProperty('file_event')) {
        if (data.file_event === true && data.files_event === false) {
            createFilePop_(data);
        }
        if (data.file_event === false && data.files_event === true) {
            createEnterPop_(data);
        }
    }
    else {
        createMessage(data.message_id, data.name, data.message, data.timestamp);
    }
});

async function createMessage(msg_id, name, msg, timestamp) {
    var user_name = localStorage.getItem('user');
    var content = '';

    msg = await aesDecrypt(msg);
    if (name == user_name) {
        content =
            `<div class="message-container" id="${msg_id}">
            <div class="message-current-user">
                <div class="message-current">
                    <strong class="user_name" , Optima, Arial, sans-serif;">You<br></strong>
                    <br><label class="msg" id="msg${msg_id}" style="user-select: text;"></label><br>
                    <span class="muted" style="float: right; color: #90b584;">
                        <button class="delete-btn" onclick="delete_msg_event(this)" title="Delete This Message"">
                        <!--<img src=${del_ico} alt="Icon">-->Delete Message</button>|
                        <button class="translate-btn" onclick="set_button(this)" title="Translate This Message to English"
                            style="background-color: transparent; border: none; cursor: pointer; color: white;">
                            <!--<img src="{{ url_for('static', filename='images/translate.png') }}" alt="Icon">-->Translate</button>| ${timestamp}
                    </span>
                </div>
            </div>
        </div>`;
    } else {
        content =
            `<div class="message-container" id="${msg_id}">
                <div class="message-other-user">
                    <div class="message-other">
                        <strong class="user_name" , Optima, Arial, sans-serif;">${name}<br></strong>
                        <br><label class="msg" id="msg${msg_id}" style="user-select: text;"></label><br>
                        <span class="muted" style="float: right; color: #6ea3a7;">
                            <!--<button class="delete-btn" onclick="delete_msg_event(this)" title="Delete This Message"
                                style="background-color: transparent; border: none; cursor: pointer;">
                            <img src=${del_ico} alt="Icon"></button>| -->
                            <button class="translate-btn" onclick="set_button(this)" title="Translate This Message to English"
                                style="background-color: transparent; border: none; cursor: pointer; color: white; margin-right: auto;">
                                <!--<img src="{{ url_for('static', filename='images/translate.png') }}" alt="Icon">-->Translate</button>| ${timestamp}
                        </span>
                    </div>
                </div>
            </div>`;
    }
    var messagesContainer = document.getElementById('message-box');
    messagesContainer.innerHTML += content;
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
    document.getElementById("msg" + msg_id).innerText = msg;
};

socket.on('disconnect', function () {
    server_connection = false;
    showPopup('Disconnected from the server.. 😓');
});

socket.on('connect', function () {
    showPopup("Server is back online! 🥳");
    server_connection = true;
});

window.toggleSideMenu = function () {
    var sideMenu = document.getElementById('side-menu');
    var menuBtn = document.getElementById('menu-btn');
    if (sideMenu.style.width === '250px') {
        sideMenu.style.width = '0';
        menuBtn.innerHTML = '&#9776; Show all rooms';
    } else {
        sideMenu.style.width = '250px';
        menuBtn.innerHTML = '&#10005; Close';
    }
}

showFiles = function (files_flag = 1) {
    if (localStorage.getItem('key') !== null) {
        var roomDirectory = 'uploads/' + localStorage.getItem('room_code');

        fetch('/get_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomDirectory: roomDirectory }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Got these files from the server: ", data.files);
                if (files_flag === 0) {
                    var fileCount = data.files.length;
                    document.getElementById('showFilesBtn').innerHTML = `Show ${fileCount} file${fileCount !== 1 ? 's' : ''} in the room`;
                }
                else {
                    var fileCount = data.files.length;
                    document.getElementById('showFilesBtn').innerHTML = `Show ${fileCount} file${fileCount !== 1 ? 's' : ''} in the room`;
                    displayFileList(data.files);
                }
            })
            .catch(error => alert('Error fetching files:', error));
    }
    else {
        alert("Unauthorized connection");
        window.location.href = '/rooms';
    }
};

const deleteFile = function (file) {
    fetch(`/delete_file/${file}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showPopup('File "' + file + '" deleted successfully');
                files_flag = 1;
                showFiles();
                return;
            } else {
                console.error('Error deleting file:', data.error);
            }
        })
        .catch(error => console.error('Error deleting file:', error));
}

fetchFile = (filename) => {
    if (localStorage.getItem('key') !== null) {
        showLoadingAnimation();
        fetch(`/room/downloads/${filename}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.blob();
            })
            .then(blob => {
                // Create a temporary URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a link element
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                link.click();
                hideLoadingAnimation();

                // Clean up the temporary URL
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                alert('Error:', error);
            });
    }
};

function updateDownloadButtonVisibility() {
    var selectedFiles = document.querySelectorAll('.file-checkbox:checked');
    var downloadSelectedButton = document.getElementById('download-multiple');

    downloadSelectedButton.style.display = selectedFiles.length > 1 ? 'block' : 'none';
}

window.closeFilesModal = function () {
    document.getElementById('fileModal').style.display = 'none';
};

function deleteZipFile(room_code, filename) {
    fetch(`/delete_zip/${room_code}/${filename}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return;
            } else {
                console.error('Error deleting zip file:', data.error);
            }
        })
        .catch(error => console.error('Error deleting zip file:', error));
}

function downloadSelectedFiles() {
    if (localStorage.getItem('key') !== null) {
        const selectedFiles = Array.from(document.querySelectorAll('.file-checkbox:checked')).map(checkbox => checkbox.value);

        data = {
            'room': localStorage.getItem('room_code'),
            'selectedfiles': selectedFiles
        }

        if (selectedFiles.length > 0) {
            fetch('/download_multiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                })
                .then(blob => {
                    var room_code = localStorage.getItem('room_code');
                    var downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = room_code + '_' + 'selected_files.zip';

                    downloadLink.click();
                    URL.revokeObjectURL(downloadLink.href);

                    deleteZipFile(room_code, room_code + '_' + 'selected_files.zip');
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            alert('Please select at least one file to download.');
        }
    }
}

document.getElementById('download-multiple').addEventListener('click', downloadSelectedFiles);

function changeroom(room) {
    if (server_connection === true) {
        localStorage.setItem('room_code', room);
        window.location.href = "/room/" + room;
    } else {
        alert("Cannot reach the server at the moment. Try again later.");
    }
}

function findMessageByContent(content, caseSensitive) {
    var messageContainers = document.getElementsByClassName('message-container');
    var count = 0;
    var matchedContainers = [];
    var flags = caseSensitive ? 'g' : 'gi';
    var regexp = new RegExp(content.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);

    for (var i = 0; i < messageContainers.length; i++) {
        var userName = messageContainers[i].querySelector('.user_name').textContent.trim();
        var messageContent = messageContainers[i].querySelector('.msg').textContent.trim();

        var highlightedUserName = userName.replace(regexp, function (match) {
            count++;
            return '<span class="highlight">' + match + '</span>';
        });
        var highlightedMessageContent = messageContent.replace(regexp, function (match) {
            count++;
            return '<span class="highlight">' + match + '</span>';
        });

        if (highlightedUserName !== userName || highlightedMessageContent !== messageContent) {
            matchedContainers.push(messageContainers[i]);
        }

        messageContainers[i].querySelector('.user_name').innerHTML = highlightedUserName;
        messageContainers[i].querySelector('.msg').innerHTML = highlightedMessageContent;
    }
    document.getElementById('searchmessage').value = content;
    if (content === '') {
        document.getElementById('searchCount').textContent = '';
    } else {
        document.getElementById('searchCount').textContent = "Found " + count + " matches";
    }
}

document.getElementById('searchmessage').addEventListener('input', function () {
    var searchTerm = this.value.trim();
    var caseSensitive = document.getElementById('caseSensitiveCheckbox').checked;
    findMessageByContent(searchTerm, caseSensitive);
});

document.getElementById('caseSensitiveCheckbox').addEventListener('change', function () {
    var searchTerm = document.getElementById('searchmessage').value.trim();
    var caseSensitive = this.checked;
    findMessageByContent(searchTerm, caseSensitive);
});

function logout() {
    showLoadingAnimation()
    localStorage.clear();
    sessionStorage.clear();
    hideLoadingAnimation();
    window.location.href = '/logout';
}

const trigger_upload = function () {
    document.getElementById('upload-button').click();
}

function displayFileList(files) {
    if (localStorage.getItem('key') !== null) {
        var fileListDiv = document.getElementById('fileList');
        var fileCountLabel = document.getElementById('file_count');
        var downloadSelectedButton = document.getElementById('download-multiple');

        fileCountLabel.innerHTML = '';
        fileListDiv.innerHTML = '';

        if (files.length === 0) {
            fileCountLabel.innerHTML = '<p style="color: #ff8e68;">No files in the room.</p>';
            downloadSelectedButton.style.display = 'none';
        } else {
            var fileCount = files.length;
            fileCountLabel.innerHTML = `<p style="color: #ff8e68;">${fileCount} file${fileCount !== 1 ? 's' : ''} in the room:</p>`;

            files.forEach(file => {
                var fileDiv = document.createElement('div');
                fileDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label>
                        <input type="checkbox" class="file-checkbox" value="${file}">
                        ${file}
                    </label>
                    <div style="display: flex; gap: 5px;">
                        <!-- Add a data attribute to store the filename -->
                        <button class="delete-icon" onclick="deletefile_confirmation('${file}')" data-filename="${file}" style="color: red; font-weight: bold; background-color: transparent; border: none; cursor: pointer;">❌</button>
                            <button class="download-button" onclick="fetchFile('${file}')">Download</button>
                    </div>
                </div>
                `;
                fileListDiv.appendChild(fileDiv);
            });

            downloadSelectedButton.style.display = 'none';
            document.querySelectorAll('.file-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateDownloadButtonVisibility);
            });
        }
        document.getElementById('fileModal').style.display = 'block';
    }
};

function get_partis() {
    var room = localStorage.getItem('room_code');
    if (server_connection === true) {
        fetch('/get_partis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomDirectory: room }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("All the data coming from '/get_partis':\n", data);
                var partiCount = data.mems.length;
                var activeparti = data.status;
                PopRoomInfo(data.mems, partiCount, activeparti);
            })
            .catch(error => alert('Error fetching room information:', error));
    } else {
        alert("Cannot reach the server at the moment. Try again later.");
    }
}

function closerinfoModal() {
    document.getElementById('rinfoModal').style.display = 'none';
};

function PopRoomInfo(mems, partiCount, active) {
    if (localStorage.getItem('key') !== null) {
        var partiListDiv = document.getElementById('partiList');
        var partiCountLabel = document.getElementById('parti_count');

        partiCountLabel.innerHTML = '';
        partiListDiv.innerHTML = '';

        if (mems.length === 0) {
            partiCountLabel.innerHTML = '<p style="color: #ff8e68;">No parti in the room.</p>';
            downloadSelectedButton.style.display = 'none';
        } else {
            var partiCount = mems.length;
            partiCountLabel.innerHTML = `<p style="color: #ff8e68;">${partiCount} member${partiCount !== 1 ? 's' : ''} in the room:</p>`;

            mems.forEach(member => {
                var partiDiv = document.createElement('div');
                var status = active[member];

                if (member === localStorage.getItem('user')) {
                    member = 'You';
                }

                if (status === 1) {
                    partiDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px;">
                            <label>${member}</label>
                            <hr style="width: -webkit-fill-available; margin: 0px 30px; border: 0.001px solid #024700c2;">
                            <label style="color: green; margin-right: 4%;">Online</label>
                        </div>
                    `;
                } else if (status === 2) {
                    partiDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px;">
                            <label>${member}</label>
                            <hr style="width: -webkit-fill-available; margin: 0px 30px; border: 0.001px solid #ff9900;">
                            <label style="color: #ff9900; margin-right: 4%;">Away</label>
                        </div>
                    `;
                } else if (status === 0) {
                    partiDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px;">
                            <label>${member}</label>
                            <hr style="width: -webkit-fill-available; margin: 0px 30px; border: 0.001px solid #570000c2;">
                            <label style="color: red; margin-right: 4%;">Offline</label>
                        </div>
                    `;
                }
                partiListDiv.appendChild(partiDiv);
            });
        }
        document.getElementById('rinfoModal').style.display = 'block';
    }
}

let heartbeatInterval;

function activity_status(stat = 1) {
    if (server_connection === true) {
        fetch('/heartbeat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: stat }),
        })
            .then(response => response.json())
            .then(data => {
                if (data === 'success') {
                    console.log("Heartbeat successfull.");
                }
                if (data === 'success') {
                    alert("Some error occured in setting your activity status. The page will automatically refresh once you click ok.");
                    location.reload(true);
                }
            })
            .catch(error => {
                if (server_connection === true) {
                    this.alert('Error while sending heartbeat ', error);
                }
            });
    };
}

document.addEventListener('visibilitychange', function () {
    clearInterval(heartbeatInterval);
    if (document.visibilityState === 'hidden') {
        if (server_connection === true) {
            heartbeatInterval = setInterval(function () {
                activity_status(2)
            }, 1 * 60 * 1000); // 1 minute interval
        }
    } else if (document.visibilityState === 'visible') {
        if (server_connection === true) {
            heartbeatInterval = setInterval(function () {
                activity_status()
            }, 1 * 60 * 1000); // 1 minute interval
        }
    }
});

