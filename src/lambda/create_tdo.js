    
import querystring from "querystring";
import fetch from "node-fetch";

let myQuery = `mutation {
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
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Since this is a POST, the token will be in the event body as a query string
  const params = querystring.parse(event.body);
  
  var theHeaders = {
    "Authorization": "Bearer " + "37196609-58be-4bc9-9edb-008b6d7dd431",
    "Content-Type": "application/json"
  };
 
  return fetch(API_ENDPOINT, { method: 'POST', headers: theHeaders, body: JSON.stringify( { query: "{me{id}}" } ) } )
    .then(response => response.json())
    .then(data => ({
      statusCode: 200,
      headers: {"content-type": "text/plain" /* "application/json" */},
      body: JSON.stringify(data)
    }))
    .catch(error => ({ statusCode: 422, body: String(error) }));
  
};
