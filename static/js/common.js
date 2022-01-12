$(document).ready(function () {
    showLoginStatus();
});


function switchLogout() {
    $.removeCookie('mytoken')
    window.location.href = '/login'
}

function showLoginStatus() {
    console.log($.cookie())
}