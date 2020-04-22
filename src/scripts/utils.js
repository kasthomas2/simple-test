// GLOBALS
let API_ENDPOINT = "https://api.veritone.com/v3/graphql";
let SLACK_GREETING = "You look good in Slacks!";
let TEXT_VALIDATION_FLUNK = "Yow, that doesn't look right. Try again.";
let DAYS_TO_STORE_TOKEN = 1;
var _token = null;
var _slackURL = null;

var TDO_QUERY_TEMPLATE = `{
  temporalDataObject(id: theID) {
    name
    id
    details
    description
    assets {
      records {
        id
        assetType
        name
        signedUri
        details
        container {
          id
        }
      }
      count
    }
    status
    engineRuns {
      count
    }
    sourceData {
      source {
        name
        details
      }
      taskId
      sourceId
      scheduledJobId
      engineId
    }
    thumbnailUrl
    previewUrl
    organization {
      id
    }
    organizationId
    jobs {
      count
    }
    sourceImageUrl
  }
}
`;

// ==== cookies ====
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function showToken( selector,  token ) {
    var tmsg = "Good news! Veritone has sent you a small token of appreciation:<br/>" +
        '<div style="color:#288;font-size:7.5pt;">' + token + '</div>';
    showMsg( "", "#message" ); // clear the default msg
    showMsg( tmsg,selector ); 
    document.querySelector(selector).style['overflow-wrap']="break-word"; 
}

// onload handler
window.addEventListener("load", function(event) 
{
    let a = "access_token=";
    let b = "tdoId=";
    var u = location.href;
	
	// check if our URL contains a token
    if (u.indexOf(a) != -1) {
        _token = u.split(a)[1].split("&")[0];
	if ( _token && _token.length > 0 ) {
            showSnackbar("We're good. Token obtained.");
	    showToken("#smallToken", _token);
	    setCookie("token", _token, DAYS_TO_STORE_TOKEN);
	}
    }
	// check if URL contains a tdoId
    else if (u.indexOf(b) != -1) {
	    
	    // If !_token, see if we have a token from a prior session
	if (!_token)
		_token = getCookie( "token" );
	    
	var tdoId = u.split(b)[1].split(/[#&]/)[0];
	handlePickerChange( tdoId );
	showSnackbar("TDO request detected.");
    }
});


function getOAuthLink() {
	
    let clientID = "557810e9-f38f-40de-991d-e0adff77cb86"; // old: "98aba40d-5bcb-4385-ac48-74763c88af74";

    let AUTH_BASE  = "https://api.veritone.com/v1/admin/oauth/authorize?scope=all&response_type=token&client_id=";

    let redirect = "&redirect_uri=" + "https://simple-test.netlify.com";

    var OAuthLink = AUTH_BASE + clientID + redirect;
	
    return OAuthLink;
}

// Utility -- use showMsg() only to show persistent screen messages; 
// use showSnackbar() otherwise.
function showMsg(msg, id) {
    var messageNode = document.querySelector( id );
    messageNode.innerHTML = msg;
}

function doNotifications(q,url) {
    let GRAPHIQL = "https://api.veritone.com/v3/graphiql?";
    var gqlLink = "<" + GRAPHIQL + "&query=" + encodeURI(q) + "|See it in GraphiQL>"; 
    var json = "\n```" + q + "```";
    sendSlackNotification( "Looks like you just ran a query of " + url + "\n" + gqlLink + json);
}

// Run a graphQL query via the lambda using GET. 
// Returns serialized JSON (string). 
// Warning: No try/catch. Wrap it at point of use!
async function runQueryGET(q, token) {

    let LAMBDA_ENDPOINT = "https://simple-test.netlify.com/.netlify/functions/gql?"
    var url = LAMBDA_ENDPOINT + "token=" + token + "&query=" + encodeURI(q);
    doNotifications(q,url);

    return fetch(url).then(function(response) {
        return response.text();
    });
}

async function getTDOs() {

    if (!_token) {
        showSnackbar("Looks like you need to log in first.", true)
        return;
    }

    var q = `query {
      temporalDataObjects(limit:100) {
        count
        records{
          id
        }
      }
    }`;

    var data = null;
    var json = null;
    
    try {
        data = await runQueryGET(q, _token);
        if ( data && typeof data == 'string') {
            json = JSON.parse( data );
            if ('errors' in json) {
                showSnackbar( "Couldn't get TDOs. Check console.", true);
                console.log(JSON.stringify( json ));
                json = null;
            }
        }
    }
    catch(e) { 
        console.log("Exception in runQuery(): " + e.toString());
        showSnackbar("Oops, ajax exception. Check console.", true); 
    }
    return json;
}

function showAssets( json ) {
    if ('assets' in json.data.temporalDataObject ) {
         var records = json.data.temporalDataObject.assets.records;
         var markup = "";
         var link = '<a href="URL" target="_blank">TARGET</a>';
         var results = [];
         var node = document.querySelector("#tdoAssets");
         records.forEach( item=> { 
             if (item.signedUri && item.signedUri.length > 0) {
                  var a = link.replace("URL",item.signedUri).replace("TARGET",item.assetType);
                  results.push( a );
             }
         });

         var msg = '<div style="font-size:var(--mediumFontSize);"><b>Assets in this TDO:</b><br/>' + results.join("<br/>") + "</div>"; 
         if (results.join("").length == 0)
			msg = '<div style="font-size:var(--mediumFontSize);"><b>No assets in this TDO</b><br/><div>';
         node.innerHTML = msg;
    }
}

// get TDOs and create picker
async function handleTDOButton() {
    var json = await getTDOs();
    if (!json) return;
    var records = json.data.temporalDataObjects.records;
    createPicker( "#tdoZone", records );
    showMsg( records.length + " TDOs total", "#tdoZoneCode" );
	
    // if Assets are showing, remove them
    showMsg("", "#tdoAssets");
	    
    // if Delete TDO button is showing, hide it
    var deleteTDOButton = document.querySelector("#deleteTDObutton");
    deleteTDOButton.style.display = "none";
}

// handle a picker change (TDO list), 
// or fetch the passed-in tdoId
async function handlePickerChange( tdoId ) {
    
    // Query to get a single TDO (uses global)
    var q = TDO_QUERY_TEMPLATE;
    var picker = document.querySelector("#TDOpicker");
    var id = tdoId || picker.value;
    var query = q.replace( /theID/, '"'+ id + '"');
    
    var json = await runQueryGET(query,_token);
    if (json && typeof json == 'string') {
        json = JSON.parse(json);
        showMsg( "", "#tdoZoneCode" ); // erase the old msg
        showMsg( JSON.stringify(json,null,3 ), "#tdoZoneCode" );
	showAssets( json );
        
            // Make the Delete TDO button visible
        var deleteTDOButton = document.querySelector("#deleteTDObutton");
        deleteTDOButton.style.display = "block";
    }
}

async function handleDeleteTDO() {
    
    // This is the mutation to delete a TDO
    var mutation_delete = `mutation {
            deleteTDO(id:theID) { id }
    }`;

    var picker = document.querySelector("#TDOpicker");
    var id = picker.value;
    var mutation_delete = mutation_delete.replace( /theID/, '"'+ id + '"');
    
    var json = await runQueryGET(mutation_delete,_token);
    if (json && typeof json == 'string') {
        json = JSON.parse(json);
        showMsg( "", "#tdoZoneCode" ); // erase the old msg
        showMsg( JSON.stringify(json,null,3 ), "#tdoZoneCode" );
    }
    location.href = "https://simple-test.netlify.com/#tdo"; // go back to start of section
}

async function handleCreateTDO() {
    
    // get its name
    var name = prompt( "Give this fine new TDO a name:" );
    if (!name) return;
       
    // This is the mutation to create a TDO
    var mutation_create = `mutation {createTDO(input:{
  name:"Some name",
  startDateTime:"startxxx",
  stopDateTime:"endxxx"
}){
  id
  name
} }`;

    mutation_create = mutation_create.replace("Some name",name);
    mutation_create = mutation_create.replace("startxxx", new Date() );
    mutation_create = mutation_create.replace("endxxx",new Date( 3600*1000 + (new Date * 1) ) );
    
    var json = await runQueryGET(mutation_create,_token);
    if (json && typeof json == 'string') {
        json = JSON.parse(json);
        var comment = 'errors' in json ? "# Error! \n" : "# Looks like you created a TDO!\n";
        showMsg( "", "#tdoZoneCode" ); // erase the old msg
        showMsg( comment + JSON.stringify(json,null,3 ), "#tdoZoneCode" );
    }
    location.href = "https://simple-test.netlify.com/#tdo"; // go back to start of section
}

// Pass this a DOM selector, and json.data.temporalDataObjects.records
function createPicker( selector, arrayOfJSONobjects ) {
    
    if (!arrayOfJSONobjects || arrayOfJSONobjects.length == 0)
        return;
    
    var html = 'We got back these TDOs: <select id="TDOpicker" onchange="handlePickerChange()">';
    var ar = [];
    var markup = null;
    
    arrayOfJSONobjects.forEach( item=> {
        var key = Object.keys(item)[0];
        var value = item[key];
        var markup = "<option value=\"" + value + "\">" + value + "</option>";
        ar.push( markup );
    });
    html += ar.sort().join("") + "</select>";
    var node = document.querySelector( selector );
    node.innerHTML = "";
    node.innerHTML = node.innerHTML + html;
}

function setSlackURL() {
    var url = document.querySelector("#slackWebhook").value;
    if ( url.indexOf("https://hooks.slack.com") == -1 || url.length < 60 ) {
        showSnackbar( TEXT_VALIDATION_FLUNK, true );
        return;
    }
    _slackURL = url; 
    showMsg("Slack URL set as: <br/><b>" + _slackURL + "</b>", "#slackMessage" );
    sendSlackNotification( SLACK_GREETING );
    showSnackbar("URL set! Check your Slack channel!");
}

function sendSlackNotification(msg) {
    
    if (!_slackURL)
        return;
    
    return fetch(_slackURL, {
        body: JSON.stringify({
            "text": msg
        }),
        method: "POST"
    }).then( r=>{
        console.log("Slack HTTP status = " + r.status + " for " + msg); 
        showSlackthing();
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
        showMsg("Successful log-in! Your token is: <mark><b>" + _token + "</b></mark><br/>" +
           "(This token will automatically be used in all API calls from this point on.)", "#message" );
        showSnackbar("Looks good. Your token is shown above.");
	setCookie("token", _token, DAYS_TO_STORE_TOKEN);
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

function showSlackthing() {

    let DURATION = 2000;

    var x = document.getElementById("slackthing");
    x.className = "show rotate-center";
    
    setTimeout(function() {
        x.className = x.className.replace("show rotate-center", "");    
    }, DURATION);
}
