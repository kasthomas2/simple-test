import querystring from "querystring";
import fetch from "node-fetch";


exports.handler = async (event, context) => {

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
    const API_ENDPOINT = 'https://api.veritone.com/v3/graphql';

    var params = null;
    var token = null;

    //Check for POST
    if (event.httpMethod == "POST") {
        params = querystring.parse(event.body);
        token = params.token;
    } // Check for GET
    else if (event.httpMethod == "GET") {
        params = querystring.parse(event.queryStringParameters);
        token = params.token;
    } // Disallow other verbs
    else {
        return {
            statusCode: 405,
            body: "Method Not Allowed " + JSON.stringify(event, null, 2)
        };
    }

    var theHeaders = {
        "Authorization": "Bearer " + params.token,
        "Content-Type": "application/json"
    };

    // works if credentials are real
    // var q = 'mutation userLogin { userLogin(input: {userName: "xxxxxx@veritone.com" password: "xxxxxxx"}) {token}}';

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
            /* "application/json" */
            "Access-Control-Allow-Origin": "*",
            /* Required for CORS support to work */
            "Access-Control-Allow-Credentials": true /* Required for cookies, authorization */
        },
        body: JSON.stringify(data)
    })).catch(error => ({
        statusCode: 422,
        body: String(error)
    }));

}; // end of lambda
