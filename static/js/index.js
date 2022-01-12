$(document).ready(function () {
    showAllParties();
});

function showAllParties() {
    $.ajax({
        type: 'GET',
        url: '/api/party_list',
        data: {},
        success: function (response) {
            let parties = response['parties'];
            console.log(parties);
            for (let i=0; i<parties.length; i++) {
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