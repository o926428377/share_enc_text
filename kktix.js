
function ticket_grabbing_master(event_name, custom_captcha, expect_price, quantity) {
    window.open(`https://kktix.com/events/${event_name}/registrations/new`, "_self");
    var base_info_url = `https://kktix.com/g/events/${event_name}/base_info`;
    var data = {"tickets":[{"id":431420,"quantity":2,"invitationCodes":[],"member_code":"","use_qualification_id":null}],"currency":"TWD","recaptcha":{},"custom_captcha":custom_captcha,"agreeTerm":true};
    data.tickets[0].quantity = quantity;
    GET(base_info_url).then(function (eventData) {
        var tickets = eventData.eventData.tickets;
        for (var _i in tickets) {
            if (expect_price.includes(tickets[_i].price.cents/100)) {
                // authenticity_token = $("meta[name=csrf-token]").attr("content");
                GET_token("https://kktix.com/events/stomp2022-02/registrations/new", _i).then(function (csrf_token) { 
                    data.tickets[0].id = tickets[csrf_token.idx].id;
                    POST(`https://queue.kktix.com/queue/${event_name}?authenticity_token=${encodeURIComponent(csrf_token.authenticity_token)}`, data).then(function (token) {
                        GET(`https://queue.kktix.com/queue/token/${token.token}`).then(function (result) {
                            if (!result.message) {
                                console.log(`[${tickets[csrf_token.idx].id}] ${tickets[csrf_token.idx].name}金額：${tickets[csrf_token.idx].price.cents/100}`);
                                console.log(`開始劃位: https://kktix.com/events/${event_name}/registrations/${result.to_param}#/booking`);
                                window.open(`https://kktix.com/events/${event_name}/registrations/${result.to_param}#/booking`);
                            }
                        });
                    });
                });
            }
        }
    });
}

function ticket_grabbing(event_name, custom_captcha, expect_price, quantity) {
    var xx = window.open(`https://kktix.com/events/${event_name}/registrations/new`);
    var script = document.createElement('script');
    script.src = 'https://o926428377.github.io/share_enc_text/kktix.js';
    xx.document.head.appendChild(script);
    var exec = document.createElement('script');
    exec.append(`window.onload=function(){ticket_grabbing_master("${event_name}", "${custom_captcha}", ${expect_price},${quantity});}`)
    xx.document.head.appendChild(exec);
}

/*
Mac
1. 登入 https://kktix.com/users/sign_in
2. command + option + I
3. 點選『console』
4. 貼上並執行 $.getScript('https://o926428377.github.io/share_enc_text/kktix.js')
5. 貼上並執行 ticket_grabbing("stomp2022-02", "台北", [2400,2000], 2)

Windows
1. 登入 https://kktix.com/users/sign_in
2. F12
3. 點選『console』
4. 貼上並執行 $.getScript('https://o926428377.github.io/share_enc_text/kktix.js')
5. 貼上並執行 ticket_grabbing("stomp2022-02", "台北", [2400,2000], 2)
*/

// ticket_grabbing("stomp2022-02", "台北", [2400,2000]);
