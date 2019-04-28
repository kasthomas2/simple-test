// GLOBALS
let API_ENDPOINT = "https://api.veritone.com/v3/graphql";

var _token = null;

// =================================================================

// Utility -- use showToken() only to show the token, 
// use showSnackbar() otherwise
function showToken(msg) {
    var messageNode = document.querySelector("#message");
    messageNode.innerHTML = msg;
}

function login() {
    var username = document.querySelector("#username").value;
    var pw = document.querySelector("#pw").value;
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
            showSnackbar("That log-in didn't work.", true);
            return;
        }
        _token = json.data.userLogin.token;
        console.log(JSON.stringify(json));
        showToken("Successful log-in! Your token is: <b>" + _token + "</b>");
        showSnackbar("Looking good. Your token is shown above.")
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
