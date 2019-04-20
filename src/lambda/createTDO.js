    
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

const API_ENDPOINT = 'https://api.veritone.com/v3/graphql';

exports.handler = async (event, context) => {
    
  // Only allow incoming POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed " + JSON.stringify(event,null,2) };
  }
  if (event.body == "" || !event.body) {
    return { statusCode: 405, body: "Empty body??? " };
  }

  // Since this is a POST, the token will be in the event body as a query string
  var params = querystring.parse(event.body);
  
  var theHeaders = {
    "Authorization": "Bearer " + params.token, 
    "Content-Type": "application/json"
  };

    // works
  var q = 'mutation userLogin { userLogin(input: {userName: "kthomas@veritone.com" password: "xxxxxxx"}) {token}}';
    
  var oneLineQuery = myQuery.replace( /\n/g,"" );
  var queryJSON = { query:  oneLineQuery };
    
  return fetch(API_ENDPOINT, { method: 'POST', headers: theHeaders, body: JSON.stringify( queryJSON ) } )
    .then(response => response.json())
    .then(data => ({
      statusCode: 200,
      headers: { "content-type": "text/plain", /* "application/json" */
                 "Access-Control-Allow-Origin" : "*", /* Required for CORS support to work */
                 "Access-Control-Allow-Credentials" : true /* Required for cookies, authorization */
               }, 
      body: JSON.stringify(data) 
    }))
    .catch(error => ({ statusCode: 422, body: String(error) }));
  
};
