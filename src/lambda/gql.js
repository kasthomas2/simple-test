import fetch from "node-fetch";

var myQuery = null;
var token = null

// GraphQL server endpoint:
var API_ENDPOINT = "https://api.veritone.com/v3/graphql";

exports.handler =  function(event, context) {

    // Disallow anything but GET & POST
    if (event.httpMethod != "GET" && event.httpMethod != "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    } 

    if ( event.httpMethod == "POST" ) {
        token = JSON.parse(event.body).token;
        myQuery = JSON.parse(event.body).query;
    }
    else {
        token = event.queryStringParameters.token;
        myQuery = decodeURI(event.queryStringParameters.query);
    }
  
    var theHeaders = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };

    // groom the query!
    var oneLineQuery = myQuery.replace(/\n/g, "");
    var queryJSON = {
        query: oneLineQuery
    };

    // hit the server
    return fetch(API_ENDPOINT, {
        method: 'POST',
        headers: theHeaders,
        body: JSON.stringify(queryJSON) 
    }).then(response => response.json()).then(data => ({
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Credentials": "true" 
        },
        body:  JSON.stringify( data ) 
    })).catch(error => ({
        statusCode: 422,
        body: String(error)
    }));
}; // end of lambda
