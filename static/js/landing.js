var drop_but = document.getElementById('drop-btn');

document.getElementById("drop-btn").onclick = function () {
    var dropdownContent = document.querySelector(".dropdown-content");
    if (dropdownContent.style.display === "none" || dropdownContent.style.display === "") {
        dropdownContent.style.display = "flex";
        drop_but.innerHTML = `${user} &#x25B4;`;
        var availableWidth = document.documentElement.clientWidth - dropdownContent.parentElement.offsetLeft;
        dropdownContent.style.maxWidth = availableWidth + "px";
    } else {
        drop_but.innerHTML = `${user} &#x25BE;`;
        dropdownContent.style.display = "none";
    }
}

function jtr() {
    window.location.href = '/login';
}

function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/logout';
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.style.display === "flex") {
                drop_but.innerHTML = `${user} &#x25BE;`;
                openDropdown.style.display = "none";
            }
        }
    }
}