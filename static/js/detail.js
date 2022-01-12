$(document).ready(function () {
    showPartyInfo();
    showEmptyEntryNum();
    showFullOccupiedMessage();
});

function showPartyInfo() {
    let favorite_mbti_array = $('#favorite_mbti').val().split(",")
    for (i=0; i<favorite_mbti_array.length; i++) {
        let mbti = favorite_mbti_array[i]
        unit_mbti_html = `<div class="mbti-text">${mbti}</div>`
        $('#favorite-mbti-entries').append(unit_mbti_html)
    }

    let member_info = $("#member-info").val()
    let member_info_array = getEmptyEntryNum() === 0
        ? member_info.split(";")
        : member_info.concat(";,,").split(";")

    for (i=0; i<member_info_array.length; i++) {
        [mbti,user_name,user_id] = member_info_array[i].split(",")
        let img_num = getRandomInt(1,7).toString()
        let img_addr = "../static/assets/images/users/man"+img_num+".png"
        console.log(img_num);
        console.log(img_addr);
        joined_html = `
                        <div class="member-entry card">
                            <div class="member-entry__image" style="background-image: url('${img_addr}');background-size: cover"></div>
                            <div class="card-body">
                                <button onclick="joinParty()" class="btn btn-primary" ${user_id === '' ? '' : 'style="display: none"'}>참여하기</button>
                                <h5 class="member-entry__mbti card-title">${mbti}</h5>
                                <a href="mailto:${user_id}>"><p class="member-entry__id card-text">${user_name}</p></a> 
                            </div> 
                        </div>
                      `
        $('#member-entries').append(joined_html)
    }
}

function showFullOccupiedMessage() {
    if (isFullOccupied()) {
        blind_layer_html = `
            <div class="blind_layer">
                    <p class="title">모집 마감👏</p>
                    <a href="/">돌아가기</a>
            </div>            
        `
        return $('#party-box').append(blind_layer_html)
    }
}

function showEmptyEntryNum() {
    let max_entry_num = getMaxEntryNum()
    let empty_entry_num = getEmptyEntryNum()

    $('#party-size').append(`${empty_entry_num}/${max_entry_num}명`)
}

function joinParty() {
    let party_id = $('#party-id').val()
    let user_id = $('#user-id').val()

    $.ajax({
        type: 'POST',
        url: 'api/join_party',
        data: {party_id_request: party_id, user_id_request: user_id},
        success: function() {
            window.location.reload()
        }
    });
}


/* util functions */
function getMaxEntryNum() {
    return $('#max-member-num').val()
}

function getOccupiedEntryNum() {
    let member_info = $('#member-info').val()
    return member_info.indexOf(";") === -1
        ? 1
        : member_info.split(";").length
}

function getEmptyEntryNum() {
    return getMaxEntryNum() - getOccupiedEntryNum()
}

function isFullOccupied() {
    return getEmptyEntryNum() === 0
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max-min) + min);
}

