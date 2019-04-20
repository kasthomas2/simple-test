import querystring from "querystring";
import fetch from "node-fetch";

    var myQuery = `mutation {
    createTDO(
      input: {
        startDateTime: 1548432520,
        stopDateTime: 1548436341
      }
    )
    {
      id
      status
    }
  }
  `;

    // GraphQL server endpoint:
    var API_ENDPOINT = "https://api.veritone.com/v3/graphql";

exports.handler =  function(event, context) {

    var params = null;
    var token = null;
    
    token = event.queryStringParameters.token;
    
    //Check for POST
    if (event.httpMethod == "POST") {
        params = querystring.parse(event.body);
        token = params.token;
    } 

    var theHeaders = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };

    // groom the query!
    var oneLineQuery = myQuery.replace(/\n/g, "").replace(/"/g, '\"');
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
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Credentials": true 
        },
        body: JSON.stringify(data) + " \nevent: " + JSON.stringify( event, null, 2 )
    })).catch(error => ({
        statusCode: 422,
        body: String(error)
    }));
}; // end of lambda

