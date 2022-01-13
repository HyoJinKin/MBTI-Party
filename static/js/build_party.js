$(document).ready(function () {
    for(let i = 1; i <= 100; i++){
        $("#max_member_num").append('<option value="' +i+ '">'+i+'</option>');
    }
});

let mbtis = "";
function select_mbti(mbti, options) {
    $("#mbti_list").empty();
    let optionArray = new Array();
    options.forEach(function (e){
        (e != "" && e != "0") ? optionArray.push(e) : false;
    });
    console.log(optionArray.length);
    let result = (mbti === "0") ? true : false;
    if(result) {
        mbtis = "";
        for(let i = 0; i<optionArray.length; i++) {
            $("#mbti_list").append(optionArray[i]+" ");
        }
    }
    else {
        mbtis += mbti+ " ";
        $("#mbti_list").text(mbtis);
    }
}

function makeParty() {
    let purpose = $("#select_purpose").val();
    let mbti = $("#mbti_list").text().split(" ").join(",").slice(0,-1);
    let title = $("#title").val();
    let description = $("#description").val();
    let max_member_num = $("#max_member_num").val();

    (purpose == "" || purpose == null) ? alert("파티 목적을 선택해주세요!") :
        (mbti == "" || mbti == null) ? alert("원하는 MBTI를 선택해주세요!") :
            (title == "" || title == null) ? alert("파티 제목을 입력해주세요!") :
                (description == "" || description == null) ? alert("파티 설명을 입력해주세요!") :
                        $.ajax({
                            type: "POST",
                            url: "/build_party",
                            data: {purpose_give: purpose, mbti_give : mbti, title_give: title, description_give : description, max_member_num_give : max_member_num},
                            success: function (response) {
                                alert(response["msg"]);
                                window.location.href="/";
                            }
                        });
}

function showMbtiRel() {
    modal_html = `
        <div class="mbti-rel-img" style="background-image: url("static/assets/images/mbti_rels/mbtirelation.png");background-size: cover"></div>
    `
    
}

