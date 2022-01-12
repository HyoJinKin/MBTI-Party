function switchLogout() {
    $.removeCookie('mytoken')
    window.location.href = '/login'
}