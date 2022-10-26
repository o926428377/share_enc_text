function POST(uri, post_body, i=1){
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open("POST", uri, true);
        xhr.setRequestHeader('accept','application/json, text/plain, */*');
        xhr.setRequestHeader('accept-language','zh-TW,zh;q=0.9');
        xhr.setRequestHeader('content-type','text/plain');
        xhr.onreadystatechange = async function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                var body = JSON.parse(xhr.responseText);
                if (body.result === "not_found") {
                    setTimeout(function(){
                        POST(uri, post_body, i+1).then(function (result) {
                            resolve(result);
                        });
                    }, 2000*i);
                } else {
                    resolve(body);
                }
            } else if (xhr.status == 429) {
                setTimeout(function(){
                    POST(uri, post_body, i+1).then(function (result) {
                        resolve(result);
                    });
                }, 2000*i);
            } else if (xhr.status == 500) {
                reject(false);
            }
        }
        xhr.send(JSON.stringify(post_body));
    })
}

function GET(uri){
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open("GET", uri, true);
        xhr.setRequestHeader('accept','application/json, text/plain, */*');
        xhr.setRequestHeader('accept-language','zh-TW,zh;q=0.9');
        xhr.setRequestHeader('content-type','text/plain');
        xhr.onreadystatechange = async function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                var body = JSON.parse(xhr.responseText);
                if (body.result === "not_found") {
                    GET(uri).then(function (result) {
                        resolve(result);
                    });
                } else {
                    resolve(body);
                }
            } else if (xhr.status == 500) {
                reject(false);
            }
        }
        xhr.send();
    })
}

function GET_token(uri){
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open("GET", uri, true);
        xhr.setRequestHeader('accept-language','zh-TW,zh;q=0.9');
        xhr.setRequestHeader('content-type','text/plain');
        xhr.onreadystatechange = async function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText);
            } else if (xhr.status == 500) {
                reject(false);
            }
        }
        xhr.send();
    })
}

function take_seat(event_name, custom_captcha, expect_price) {
    var base_info_url = `https://kktix.com/g/events/${event_name}/base_info`;
    var authenticity_token, url;
    var re = /<meta name="csrf-token" content="([^"]*)" \/>/i;
    var data = {"tickets":[{"id":431420,"quantity":2,"invitationCodes":[],"member_code":"","use_qualification_id":null}],"currency":"TWD","recaptcha":{},"custom_captcha":custom_captcha,"agreeTerm":true};
    GET(base_info_url).then(function (eventData) {
        var tickets = eventData.eventData.tickets;
        // tickets = [tickets[0]];
        for (var _i in tickets) {
            if (expect_price.includes(tickets[_i].price.cents/100)) {
                data.tickets[0].id = tickets[_i].id;
                data.tickets[0].quantity = 2;
                // authenticity_token = $("meta[name=csrf-token]").attr("content");
                GET_token("https://kktix.com/events/stomp2022-02/registrations/new").then(function (html) { 
                    authenticity_token = html.match(re)[1];
                    url = `https://queue.kktix.com/queue/${event_name}?authenticity_token=${encodeURIComponent(authenticity_token)}`;
                    POST(url, data).then(function (token) {

                        GET(`https://queue.kktix.com/queue/token/${token.token}`).then(function (result) {
                            if (!result.message) {
                                console.log(`[${tickets[_i].id}] ${tickets[_i].name}金額：${tickets[_i].price.cents/100}`);
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

/*
Mac
1. 登入 https://kktix.com/users/sign_in
2. command + option + I
3. 點選『console』
4. 貼上並執行『$.getScript('https://zoss-clock-in.web.app/js/711_download.js')』
5. 貼上並執行take_seat("stomp2022-02", "台北", [2400,2000])

Windows
1. 登入 https://kktix.com/users/sign_in
2. F12
3. 點選『console』
4. 貼上並執行『$.getScript('https://zoss-clock-in.web.app/js/711_download.js')』
5. 貼上並執行 take_seat("stomp2022-02", "台北", [2400,2000])
*/

// take_seat("stomp2022-02", "台北", [2400,2000]);
