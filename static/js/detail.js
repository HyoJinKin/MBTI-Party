$(document).ready(function () {
    showPartyInfo();
    getEmptyEntryNum();
});

function showPartyInfo() {
    let party_id = $('#party-id').val()

    let favorite_mbti_array = $('#favorite_mbti').val().split(",")
    for (i=0; i<favorite_mbti_array.length; i++) {
        let mbti = favorite_mbti_array[i]
        unit_mbti_html = `<div class="mbti-text">${mbti}</div>`
        $('#favorite-mbti-entries').append(unit_mbti_html)
    }

    let member_roles_array = $('#member-roles').val().split(";")

    for (i=0; i<member_roles_array.length; i++) {
        role = member_roles_array[i].split(",")[0]
        user_id = member_roles_array[i].split(",")[1]
        let img_num = getRandomInt(1,7).toString()
        let img_addr = "../static/assets/images/users/man"+img_num+".png"
        console.log(img_num);
        console.log(img_addr);
        joined_html = `
                        <div class="member-entry card">
                            <div class="member-entry__image" style="background-image: url('${img_addr}');background-size: cover"></div>
                            <div class="card-body">
                                <h5 class="member-entry__role card-title">${role}</h5>
                                <p class="member-entry__id card-text">${user_id}</p>
                                <button onclick="joinParty(party_id,user_id,role)" class="btn btn-primary" ${user_id=='' ? '' : 'style="display: none"'}>참여하기</button>
                            </div> 
                        </div>
                      `
        $('#member-entries').append(joined_html)
    }
}

function joinParty(partyId, userId, role) {
    $.ajax({
        type: 'POST',
        url: 'api/join_party',
        data: {party_id_request: partyId, user_id_request: userId, role_request: role},
        success: function(response) {
            window.location.reload()
        }
    });
}

function getEmptyEntryNum() {
    let max_entry_num = $('#max-member-num').val()
    let occupied_entry_num = $('#member-ids').val().split(",").length
    let empty_entry_num = max_entry_num - occupied_entry_num;
    $('#party-size').append(`${empty_entry_num}/${max_entry_num}명`)
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max-min) + min);
}

