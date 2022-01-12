function insertEmailInput() {
    // selectedValue = $('ID-Address').val();
    // if (selectedValue == "직접 입력") {
    let temp_html = `<input type="text" id="emailInputBox" placeholder="예) asdtyu@empas.com">`;
    $('.ID').append(temp_html);
    // }
}


function registerUser() {
    let emailAddress = $('#ID-Address option:selected').val()
    $.ajax({
        type: "POST",
        url: "/register",
        data: {
            name_give: $('#name').val(),
            regisNum_give: $('#regisNum').val(),
            id_give: $('#ID').val() + emailAddress,
            password_give: $('#password').val(),
            MBTI_give: $('#MBTI').val()

        },
        success: function (response) {
            alert(response['msg'])

        }
    })
    // window.location.reload();
}

function is_nickname(asValue) {
    var regExp = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{2,10}$/;
    return regExp.test(asValue);
}

function is_password(asValue) {
    var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
    return regExp.test(asValue);
}


function is_password_thesame() {
    alert('test')
}

pOrF = false;

function check_dup() {
    let username = $("#ID").val();
    console.log(username)
    if (username == "") {
        alert("아이디를 입력해주세요.")
        $("#ID").removeClass('is-success').addClass('is-fail');
        $("#ID").focus()
        return;
    }
    if (!is_nickname(username)) {
        alert("아이디의 형식을 확인해주세요. 영문과 숫자, 일부 특수문자(._-) 사용 가능. 2-10자 길이")
        $("#ID").removeClass('is-success').addClass('is-fail');
        $("#ID").focus()
        return;
    }

    checkID();
}

function checkID() {
    let id = $('#ID').val();
    let emailAddress = $('#ID-Address option:selected').val();
    $.ajax({
        type: "POST",
        url: "/register/checkid",
        data: {id_give: id + emailAddress},
        success: function (response) {
            console.log(response['msg'])
            let exists = response['exists']
            if (exists == true) {
                alert('중복되는 아이디입니다. 다시 시도해주세요.')
                $("#ID").removeClass('is-success').addClass('is-fail')
            }
            if (exists == false) {
                alert('사용 가능한 아이디입니다.')
                $("#ID").removeClass('is-fail').addClass('is-success')
            }
        }
    })
    // window.location.reload();
}

function idCheckFirst() {
    if ($('#ID').hasClass('is-success')) {
        registerUser();
    }
    else{
        alert('먼저 아이디 사용 가능 여부를 확인해주세요.')
        return;
    }

}

