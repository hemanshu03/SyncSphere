const socket = io.connect('https://' + document.domain + ':' + location.port);
socket.emit("Check_SID_Validity");

document.addEventListener('DOMContentLoaded', function () {
    check_if_password_entered();
});

const storedKeyString = localStorage.getItem('key');
const storedKeyArray = storedKeyString.split(',').map(Number);
const storedKey = new Uint8Array(storedKeyArray);

let room_code;
var files_flag = 0;
var dropdownContent = document.getElementById("languageDropdown");

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

function keyExists(key) {
    return localStorage.getItem(key) !== null;
}

function check_if_password_entered() {
    if (keyExists('key')) {
        console.log("All ok");
    }
    else {
        window.location.href = '/rooms'
    }
}

// Maintain a mapping of language names to their codes
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
            if (userName == user_name) {
                translatedDiv.classList.add('translated-message-current');
                translatedDiv.innerHTML = `
                <div class="message-current-translate">
                    <label style="font-size: small; font-weight: 500; color: #9f9f9f;">Translated message by "${userName}" from language "${translatedData.sourceLanguage}" to "${language}".</label><br>
                    <label class="translated-msg" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">${translatedData.translatedText}</label><br>
                </div>
            `;
            }
            else {
                translatedDiv.classList.add('translated-message-other');
                translatedDiv.innerHTML = `
                <div class="message-other-translate">
                    <label style="font-size: small; font-weight: 500; color: #9f9f9f;">Translated message by "${userName}" from language "${translatedData.sourceLanguage}" to "${language}".</label><br>
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
    var user_name_ = localStorage.getItem('user');
    var en_msg = await aesEncrypt(message.value);
    en_msg = new Uint8Array(en_msg).toString()
    socket.emit("message", { data: en_msg, name: user_name_, room_code: room_code });
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
    const { keyCode, target } = event;
    const isMessageInput = target.id === 'message-input';
    if (keyCode === 13 && isMessageInput) {
        event.preventDefault();
        sendMessage();
    }
}

function scrollMessageBoxToBottom() {
    const messageBox = document.getElementById('message-box');
    messageBox.scrollTop = messageBox.scrollHeight;
}

const createEnterPop_ = (content) => {
    const line = document.createElement('div');
    line.classList.add('enter-line');

    line.innerHTML = `${content.name} ${content.message} ${content.timestamp}`;

    const messageContainer = document.getElementById('message-box');
    messageContainer.appendChild(line);
};

const delete_msg_event = (button) => {
    const messageDiv = button.closest('.message-container');
    const messageId = messageDiv.id;
    if (shouldAskConfirmation()) {
        deletemsg_confirmation(messageDiv, messageId)
    } else {
        deleteMessage(messageDiv, messageId);
    }

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

socket.on('connect_event', function (content) {
    createEnterPop_(content);
});

const sendFile = function () {
    event.preventDefault();
    var fileInput = document.querySelector('input[type="file"]');
    var files = fileInput.files;
    var message = "";

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

socket.on('message', function (data) {
    if (data.enter_event === true) {
        createEnterPop_(data);
    } else {
        createMessage(data.message_id, data.name, data.message, data.timestamp, 1);
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
                    <strong class="user_name" , Optima, Arial, sans-serif;">${name}<br></strong>
                    <br><label class="msg" style="user-select: text;"> ${msg}</label><br>
                    <span class="muted" style="float: right; color: #41ff00;">
                        <button class="delete-btn" onclick="delete_msg_event(this)" title="Delete This Message"
                            style="background-color: transparent; border: none; cursor: pointer;">
                        <img src=${del_ico} alt="Icon"></button>|
                        <button class="translate-btn" onclick="set_button(this)" title="Translate This Message to English"
                            style="background-color: transparent; border: none; cursor: pointer;">
                        <img src=${translate_ico} alt="Icon"></button>| ${timestamp}
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
                        <br><label class="msg" style="user-select: text;"> ${msg}</label><br>
                        <span class="muted" style="float: left; color: #00ecff;">
                            <button class="delete-btn" onclick="delete_msg_event(this)" title="Delete This Message"
                                style="background-color: transparent; border: none; cursor: pointer;">
                            <img src=${del_ico} alt="Icon"></button>|
                            <button class="translate-btn" onclick="set_button(this)" title="Translate This Message to English"
                                style="background-color: transparent; border: none; cursor: pointer;">
                            <img src=${translate_ico} alt="Icon"></button>| ${timestamp}
                        </span>
                    </div>
                </div>
            </div>`;
    }
    var messagesContainer = document.querySelector('.messages');
    messagesContainer.innerHTML += content;
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
};

socket.on('connect', function () {
    showPopup('Connected to the server');
    store_creds();
});

socket.on('disconnect', function () {
    showPopup('Disconnected from the server');
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
        var roomDirectory = 'uploads/' + room_code;

        fetch('/get_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomDirectory: roomDirectory }),
        })
            .then(response => response.json())
            .then(data => {
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
            .catch(error => console.error('Error fetching files:', error));
    }
};

const deleteFile = function (file) {
    fetch(`/delete_file/${room_code}/${file}`)
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
        fetch(`/room/downloads/${room_code}/${filename}`)
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

                // Clean up the temporary URL
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
};

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
                        <button class="delete-icon" onclick="deleteFile('${file}')" data-filename="${file}" style="color: red; font-weight: bold; background-color: transparent; border: none; cursor: pointer;">❌</button>

                        <a href="#" onclick="fetchFile('${file}')">
                            <button class="download-button">Download</button>
                        </a>
                        
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
            'room': room_code,
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
    localStorage.setItem('room_code', room);
    window.location.href = "/room/" + room;
}
