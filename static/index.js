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
                let name = parties[i]['name']
                let desc = parties[i]['description']
                let favorite_mbti = parties[i]['favorite_mbti'].split(',')

                html = `
                            <div class="party-card card w-100">
                                <div class="card-body">
                                    <h5 class="card-title">${name}</h5>
                                    <p class="card-text">${desc}</p>
                                    <a href="#" class="btn btn-primary">입장</a>
                                </div>
                            </div>
                        `
                $('#party-list').append(html);
            }
        }
    });
}
