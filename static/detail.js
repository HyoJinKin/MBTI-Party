$(document).ready(function () {
    showPartyInfo();
});

function showPartyInfo() {
    let max_member_num = $('#max-member-num').val()
    let joined_member_id_array = $('#memberIds').split(",")
    let joined_member_role_array = $('#memberRoles').split(",")

    let available_entries = $('#')



    $.ajax({
        type: 'GET',
        url: 'api/show_party_info',
        data: {id_request: partyId},
        success: function(response) {
            let partyDetail = response['party'];

        }
    });
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