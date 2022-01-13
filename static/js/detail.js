$(document).ready(function () {
    showPartyInfo();
    showEmptyEntryNum();
    showFullOccupiedMessage();
});

$(document).on(function (event) {
    socket.emit('message', {id: event.target})
})

function showPartyInfo() {
    let favorite_mbti_array = $('#favorite-mbti').val().split(",").sort()
    for (i = 0; i < favorite_mbti_array.length; i++) {
        let mbti = favorite_mbti_array[i]
        unit_mbti_html = `<div class="mbti-text">${mbti}</div>`
        $('#favorite-mbti-entries').append(unit_mbti_html)
    }

    let member_info = $("#member-info").val()
    let member_info_array = getEmptyEntryNum() === 0
        ? member_info.split(";")
        : member_info.concat(";,,").split(";")

    for (i = 0; i < member_info_array.length; i++) {
        [mbti, user_name, user_id] = member_info_array[i].split(",")
        let img_num = getRandomInt(1, 7).toString()
        let img_addr = "../static/assets/images/users/man" + img_num + ".png"
        joined_html = `
                        <div class="member-entry card">
                            <div class="member-entry__image" style="background-image: url('${img_addr}');background-size: cover"></div>
                                <h5 class="member-entry__mbti card-title">${mbti}</h5>
                                <button onclick="joinParty()" class="btn btn-primary" ${user_id === '' ? '' : 'style="display: none"'}>참여하기</button>
                                <a href="mailto:${user_id}>"><p class="member-entry__id card-text">${user_name}</p></a> 
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

    console.log(party_id)
    console.log(user_id)

    $.ajax({
        type: 'POST',
        url: '/api/join_party',
        data: {party_id_request: party_id, user_id_request: user_id},
        success: function (response) {
            alert(response['msg']);
            window.location.reload();
        }
    });
}

function openChatRoom() {
    const chat_modal = document.querySelector('.chat-modal-wrapper')
    chat_modal.style.display = "flex"

    let socket = io.connect("http://" + document.domain + ":" + location.port, {transports: ['websocket']});
    //let socket = io.connect("http://localhost:5000", {transports: ['websocket']});
    let user_id = $('#user-id').val()
    let user_name = $('#user-name').val()
    let room = $('#chat-room-id').val()
    joinRoom(room);
    console.log(user_name, room)

    socket.on('connect', () => {
        let form = $('form').on('submit', e => {
            e.preventDefault();
            let user_input = $('input.message').val();
            if (user_input !== '') {
                socket.send({'msg': user_input, 'user_id': user_id, 'user_name': user_name, 'room': room});
            }
            $('input.message').val('').focus();
        });
    });

    socket.on('message', data => {
        console.log(data);
        if (data.user_id) {
            $('h3').remove();
            $('div.message_holder').append(`<p><span style="font-weight: bold">${data.user_name}</span><span>     </span>${data.msg} (${data.time_stamp})</p>`);
        } else {
            printSysMsg(data.msg);
        }
    });

    $(document).ready(function () {
        $('input.message').focus();
        // document.querySelectorAll('.select-room').forEach(p => {
        //     p.onclick = () => {
        //         console.log('asdasd');
        //         let newRoom = p.innerHTML;
        //         if(newRoom === room) {
        //             let msg = `이미 ${room}방에 있습니다.`;
        //             printSysMsg(msg);
        //         }
        //         else {
        //             leaveRoom(room);
        //             joinRoom(newRoom);
        //             room = newRoom;
        //         }
        //     };
        // });
    });

    function joinRoom(room) {
        console.log('joinRoom');
        socket.emit('join', {'user_id': user_id, 'room': room});
        //채팅창 클리어
        $('div.message_holder').val('');
    }

    function printSysMsg(msg) {
        $('div.message_holder').append(msg + "<br>");
    }
}

function closeChatRoom() {
    const chat_modal = document.querySelector('.chat-modal-wrapper')
    chat_modal.style.display = "none"
}


function showMbtiRelScoreResult() {
    $.ajax({
        type: 'POST',
        url: '/api/join_party',
        data: {party_id_request: party_id, user_id_request: user_id},
        success: function (response) {
            alert(response['msg']);
            window.location.reload();
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
    return Math.floor(Math.random() * (max - min) + min);
}

