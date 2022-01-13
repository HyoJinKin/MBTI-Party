//아이디 사용가능 여부 확인
function IdCheck() {
    let username = $("#ID").val();
    //아이디가 빈 값인지 확인
    if (username == "") {
        // alert("아이디를 입력해주세요.")
        Swal.fire({
            icon: 'error',
            title: '아이디 미입력',
            text: '아이디를 입력해주세요.'
        });
        $("#ID").removeClass('is-success').addClass('is-fail');
        $("#ID").focus()
        return;
    }
    //아이디가 형식을 맞췄는지 확인
    if (!is_nickname(username)) {
        // alert("아이디의 형식을 확인해주세요. 영문과 숫자, 일부 특수문자(._-) 사용 가능. 2-10자 길이")
        Swal.fire({
            icon: 'error',
            title: '아이디 형식 부적격',
            text: '아이디의 형식을 확인해주세요. 영문과 숫자, 일부 특수문자(._-) 사용 가능. 2-10자 길이'
        });
        $("#ID").removeClass('is-success').addClass('is-fail');
        $("#ID").focus()
        return;
    }
    //아이디가 중복되는지 확인
    Id_dup();
}

//아이디가 형식을 맞췄는지 확인
function is_nickname(asValue) {
    var regExp = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{2,10}$/;
    return regExp.test(asValue);
}

//아이디가 중복되는지 확인
function Id_dup() {
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
                // alert('중복되는 아이디입니다. 다시 시도해주세요.')
                Swal.fire({
                    icon: 'error',
                    title: '아이디 중복',
                    text: '중복되는 아이디입니다. 다시 시도해주세요.'
                });
                $("#ID").removeClass('is-success').addClass('is-fail')
            }
            if (exists == false) {
                // alert('사용 가능한 아이디입니다.')
                Swal.fire({
                    icon: 'success',
                    title: '아이디 사용 가능',
                    text: '사용 가능한 아이디입니다.'
                });
                $("#ID").removeClass('is-fail').addClass('is-success')
            }
        }
    })
}

//비밀번호 형식을 맞췄는지 확인
function is_password() {
    let asValue = $('#password').val();
    var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
    if (!regExp.test(asValue)) {
        $('#password-help').text('비밀번호의 형식을 확인해주세요. 영문과 숫자, 일부 특수문자(!@#$%^&*) 사용 가능. 8-10자 길이')
        $('#pwNumCheck').removeClass('fasPwGreen').addClass('fasPwRed');
    } else {
        $('#password-help').text('');
        $('#pwNumCheck').removeClass('fasPwRed').addClass('fasPwGreen');
    }
}

//비밀번호가 일치하는지 확인
function is_password_thesame() {
    let pwd1 = $('#password').val();
    let pwd2 = $('#passwordCheck').val();

    if (pwd1 == pwd2) {
        $('#pwCheck').removeClass('fasred').addClass('fasgreen');
    } else {
        $('#pwCheck').removeClass('fasgreen').addClass('fasred');
    }
}

//필수입력사항들을 선택하였는지 확인
function inputCheck() {
    if ($('#name').val() == "") {
        Swal.fire({
            icon: 'error',
            title: '이름 미입력',
            text: '이름을 입력해주세요.'
        });
        return;
    }

    if ($('#regisNumCheck').hasClass('fasIdRed')) {
        Swal.fire({
            icon: 'error',
            title: '주민번호 부적격',
            text: '주민등록번호 형식을 맞춰주세요.'
        });
        return;
    }
    if ($('#ID').hasClass('is-fail')) {
        Swal.fire({
            icon: 'error',
            title: '아이디 사용 가능 여부',
            text: '먼저 아이디 사용 가능 여부를 확인해주세요.'
        });
        return;
    }

    if ($('#pwNumCheck').hasClass('fasPwRed')) {
        Swal.fire({
            icon: 'error',
            title: '비밀번호 부적격',
            text: '비밀번호 형식을 지켜주세요.'
        });
        return;
    }
    if ($('#pwCheck').hasClass('fasred')) {
        Swal.fire({
            icon: 'error',
            title: '비밀번호 불일치',
            text: '비밀번호를 일치시켜주세요.'
        });
        return;
    }

    if ($('#ID').hasClass('is-success') && $('#pwNumCheck').hasClass('fasPwGreen') && $('#regisNumCheck').hasClass('fasIdGreen') && $('#pwCheck').hasClass('fasgreen')) {
        registerUser();
    }
}

//회원등록
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
            MBTI_give: $('input[name="radioTxt"]:checked').val()

        },
        success: function (response) {
            // alert(response['msg'])
            Swal.fire({
                icon: 'success',
                title: '회원가입 완료',
                text: response['msg'],
                confirmButtonText: "예"
            }).then((result) => {
                if (result.isConfirmed)
                    window.location.href = '/login'
            });

        }
    })

}


//주민등록번호 입력 형식을 맞췄는지 확인
function regisNumCheck() {
    let asValue = $('#regisNum').val();
    var regExp = /^(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))-[1-4][0-9]{6}$/;
    if (!regExp.test(asValue)) {
        $('#regisNum-help').text('주민등록번호 형식을 확인해주세요.');
        $('#regisNumCheck').removeClass('fasIdGreen').addClass('fasIdRed');
    } else {
        $('#regisNum-help').text('');
        $('#regisNumCheck').removeClass('fasIdRed').addClass('fasIdGreen');
    }
}
