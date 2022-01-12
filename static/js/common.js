$(document).ready(function () {
    showMbtiProfileMessage();
});

function switchLogout() {
    $.removeCookie('mytoken')
    alert('로그아웃!')
    window.location.href = '/login'
}

function showMbtiProfileMessage() {
    let user_mbti = $('#user_mbti').val()
    console.log(user_mbti)
    switch (user_mbti) {
        case 'INTJ':
            html = `<span>전략가</span>`;
            break;
        case 'INTP':
            html = `<span>사색하는</span>`;
            break;
        case 'ENTJ':
            html = `<span>대담한</span>`;
            break;
        case 'ENTP':
            html = `<span>뜨거운 논쟁을 즐기는</span>`;
            break;
        case 'INFJ':
            html = `<span>선의의</span>`;
            break;
        case 'INFP':
            html = `<span>열정적인</span>`;
            break;
        case 'ENFJ':
            html = `<span>정의로운</span>`;
            break;
        case 'ENFP':
            html = `<span>재기발랄한</span>`;
            break;
        case 'ISTJ':
            html = `<span>정직한</span>`;
            break;
        case 'ISFJ':
            html = `<span>용감한</span>`;
            break;
        case 'ESTJ':
            html = `<span>엄격한</span>`;
            break;
        case 'ESFJ':
            html = `<span>사교적인</span>`;
            break;
        case 'ISTP':
            html = `<span>만능</span>`;
            break;
        case 'ISFP':
            html = `<span>호기심 많은</span>`;
            break;
        case 'ESTP':
            html = `<span>모험을 즐기는</span>`;
            break;
        case 'ESFP':
            html = `<span>자유로운 영혼의</span>`;
            break;
        default:
            html = `<span>알고싶은</span>`;
    }
    $('#mbti_profile').append(html);
}