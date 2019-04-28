// GLOBALS
let API_ENDPOINT = "https://api.veritone.com/v3/graphql";
let SLACK_GREETING = "You look good in Slacks!";
let TEXT_VALIDATION_FLUNK = "Yow, that doesn't look right. Try again.";
var _token = null;
var _slackURL = null;

// =================================================================

// Utility -- use showMsg() only to show persistent screen messages; 
// use showSnackbar() otherwise.
function showMsg(msg, id) {
    var messageNode = document.querySelector( id );
    messageNode.innerHTML = msg;
}

function setSlackURL() {
    var url = document.querySelector("#slackWebhook").value;
    if ( url.indexOf("https://hooks.slack.com") == -1 || url.length < 60 ) {
        showSnackbar( TEXT_VALIDATION_FLUNK, true );
        return;
    }
    _slackURL = url; 
    showMsg("Slack URL set as: <br/><b>" + _slackURL + "</b>", "#slackMessage" );
    sendSlackNotification( _slackURL, SLACK_GREETING );
    showSnackbar("URL set! Check your Slack channel!");
}

function sendSlackNotification(slackWebhook,msg) {
    
    if (!slackWebhook)
        return;
    
    return fetch(slackWebhook, {
        body: JSON.stringify({
            "text": msg
        }),
        method: "POST"
    }).then( r=>{
        console.log("Slack HTTP status = " + r.status + " for " + msg);      
        return r; 
    });
}

function login() {
    var username = document.querySelector("#username").value;
    var pw = document.querySelector("#pw").value;
    if (username.length < 6 || pw.length < 2) {
        showSnackbar( TEXT_VALIDATION_FLUNK, true );
        return;
    }
    loginAndGetToken(username, pw);
}

function loginAndGetToken(username, pw) {

    var q = 'mutation userLogin { userLogin(input: {userName: "' + username + '" password: "' + pw + '"}) {token}}';

    fetch(API_ENDPOINT, {
        body: JSON.stringify({
            "query": q
        }),
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST"
    }).then(function(response) {
        if (!response.ok) {
            showSnackbar("Oops. We got a " + response.status, true);
            throw new Error("HTTP error, status = " + response.status);
        }
        return response.json();

    }).then(json=>{
        if (!json.data.userLogin) {
            showSnackbar("Dang. That log-in didn't work.", true);
            return;
        }
        _token = json.data.userLogin.token;
        console.log(JSON.stringify(json));
        showMsg("Successful log-in! Your token is: <b>" + _token + "</b>", "#message" );
        showSnackbar("Looks good. Your token is shown above.")
    }
    );
}
// loginAndGetToken()

/* showSnackbar()
To use this, just put an empty <div id="snackbar"></div>
in the page somewhere, include the .css (see styles.css),
and call this function to pop the toast. 

The optional 2nd arg makes the toast red.
*/

function showSnackbar(msg, err) {

    let ERROR_COLOR = "#e25";
    let SNACK_DURATION = 3500;

    var x = document.getElementById("snackbar");
    x.innerText = msg;
    x.className = "show";
    var originalBackgroundColor = x.style["background-color"];
    if (err)
        x.style["background-color"] = ERROR_COLOR;

    setTimeout(function() {
        x.className = x.className.replace("show", "");
        x.style["background-color"] = originalBackgroundColor;
    }, SNACK_DURATION);
}
