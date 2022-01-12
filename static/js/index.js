$(document).ready(function () {
    showAllParties();
});

function showAllParties(category) {
    $.ajax({
        type: 'GET',
        url: '/api/party_list?cat='.concat(),
        data: {},
        success: function (response) {
            $('#party-list').empty();

            let user_mbti = $('#user_mbti').val()
            let parties = response['parties']
            for (let i = 0; i < parties.length; i++) {
                let id = parties[i]['id']
                let purpose = parties[i]['purpose']
                let title = parties[i]['title']
                let desc = parties[i]['description']
                let favorite_mbti = parties[i]['favorite_mbti'].split(",")

                if (parties.length === 0) {
                    html = `
                            <div class="party-card card w-100">
                                <div class="card-body">찾으시는 결과가 없습니다🤣</div>
                            </div>
                        `
                    $('#party-list').append(html);
                } else {
                    if (favorite_mbti.includes(user_mbti)) {
                        html = `    
                        <div class="party-card card w-100">
                            <div class="card-body">
                                <h5 class="card-title">${title} | ${purpose}</h5>
                                <p class="card-text">${desc}</p>
                                <a href="/detail?id=${id}" class="join-btn btn btn-primary float--right">입장</a>
                            </div>
                        </div>
                    `
                    } else {
                        html = `    
                        <div class="party-card card w-100">
                            <div class="card-body">
                                <h5 class="card-title">${title} | ${purpose}</h5>
                                <p class="card-text">${desc}</p>
                                <a href="/" onclick="showNotAllowedMessage();return false" class="denied-btn btn btn-secondary float--right">입장</a>
                            </div>
                        </div>
                    `
                    }
                    $('#party-list').append(html);
                }
            }
        }
    });
}

function showSortedParties(category) {
    $.ajax({
        type: 'GET',
        url: '/api/sorted_party_list?cat='.concat(category),
        data: {},
        success: function (response) {
            $('#party-list').empty();

            let user_mbti = $('#user_mbti').val()
            let parties = response['parties']
            for (let i = 0; i < parties.length; i++) {
                let id = parties[i]['id']
                let purpose = parties[i]['purpose']
                let title = parties[i]['title']
                let desc = parties[i]['description']
                let favorite_mbti = parties[i]['favorite_mbti'].split(",")

                if (parties.length === 0) {
                    html = `
                            <div class="party-card card w-100">
                                <div class="card-body">찾으시는 결과가 없습니다🤣</div>
                            </div>
                        `
                    $('#party-list').append(html);
                } else {
                    if (favorite_mbti.includes(user_mbti)) {
                        html = `    
                        <div class="party-card card w-100">
                            <div class="card-body">
                                <h5 class="card-title">${title} | ${purpose}</h5>
                                <p class="card-text">${desc}</p>
                                <a href="/detail?id=${id}" class="join-btn btn btn-primary float--right">입장</a>
                            </div>
                        </div>
                    `
                    } else {
                        html = `    
                        <div class="party-card card w-100">
                            <div class="card-body">
                                <h5 class="card-title">${title} | ${purpose}</h5>
                                <p class="card-text">${desc}</p>
                                <a href="/" onclick="showNotAllowedMessage();return false" class="denied-btn btn btn-secondary float--right">입장</a>
                            </div>
                        </div>
                    `
                    }
                    $('#party-list').append(html);
                }
            }
        }
    })
}

function showAllowedParties() {
    let user_mbti = $('#user_mbti').val()

    $.ajax({
        type: 'GET',
        url: '/api/allowed_party_list?mbti='.concat(user_mbti),
        data: {},
        success: function (response) {
            $('#party-list').empty();

            let user_mbti = $('#user_mbti').val()
            let parties = response['parties']
            for (let i = 0; i < parties.length; i++) {
                let id = parties[i]['id']
                let purpose = parties[i]['purpose']
                let title = parties[i]['title']
                let desc = parties[i]['description']
                let favorite_mbti = parties[i]['favorite_mbti'].split(",")

                if (parties.length === 0) {
                    html = `
                            <div class="party-card card w-100">
                                <div class="card-body">찾으시는 결과가 없습니다🤣</div>
                            </div>
                        `
                    $('#party-list').append(html);
                } else {
                    if (favorite_mbti.includes(user_mbti)) {
                        html = `    
                        <div class="party-card card w-100">
                            <div class="card-body">
                                <h5 class="card-title">${title} | ${purpose}</h5>
                                <p class="card-text">${desc}</p>
                                <a href="/detail?id=${id}" class="join-btn btn btn-primary float--right">입장</a>
                            </div>
                        </div>
                    `
                    } else {
                        html = `    
                        <div class="party-card card w-100">
                            <div class="card-body">
                                <h5 class="card-title">${title} | ${purpose}</h5>
                                <p class="card-text">${desc}</p>
                                <a href="/" onclick="showNotAllowedMessage();return false" class="denied-btn btn btn-secondary float--right">입장</a>
                            </div>
                        </div>
                    `
                    }
                    $('#party-list').append(html);
                }
            }
        }
    })
}

function showNotAllowedMessage() {
    alert("여기 파티에서는 당신을 원하지 않아요🤣")
}

