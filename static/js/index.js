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

            let parties = response['parties']
            for (let i = 0; i < parties.length; i++) {
                let id = parties[i]['id']
                let purpose = parties[i]['purpose']
                let title = parties[i]['title']
                let desc = parties[i]['description']

                html = `    
                        <div class="party-card card w-100">
                            <div class="card-body">
                            <h5 class="card-title">${title} | ${purpose}</h5>
                            <p class="card-text">${desc}</p>
                            <a href="/detail?id=${id}" class="join-btn btn btn-primary float--right">입장</a>
                        </div>
                        </div>
                `
                $('#party-list').append(html);
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

            let parties = response['parties']
            if (parties.length === 0) {
                html = `
                            <div class="party-card card w-100">
                                <div class="card-body">검색된 결과가 없습니다</div>
                            </div>
                        `
                $('#party-list').append(html);
            } else {
                for (let i = 0; i < parties.length; i++) {
                    let id = parties[i]['id']
                    let purpose = parties[i]['purpose']
                    let title = parties[i]['title']
                    let desc = parties[i]['description']

                    html = `
                            <div class="party-card card w-100">
                                <div class="card-body">
                                <h5 class="card-title">${title} | ${purpose}</h5>
                                <p class="card-text">${desc}</p>
                                <a href="/detail?id=${id}" class="join-btn btn btn-primary float--right">입장</a>
                                </div>
                            </div>
                    `
                    $('#party-list').append(html);
                }
            }
        }
    })
}




