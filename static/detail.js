$(document).ready(function () {
    showPartyInfo();
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
        console.log(role, user_id)
        joined_html = `<div class="member-entry__role">${role}</div><div class="member-entry__id">${user_id}</div>`
        $('#member-entries').append(joined_html)
    }
}

// function joinParty(partyId, userId, role) {
//     $.ajax({
//         type: 'POST',
//         url: 'api/join_party',
//         data: {party_id_request: partyId, user_id_request: userId, role_request: role},
//         success: function(response) {
//             window.location.reload()
//         }
//     });
// }