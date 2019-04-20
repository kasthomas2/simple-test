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
  
  let myHeaders = {
    "Authorization": "Bearer " + params.token,
    "Content-Type": "application/json"
  };
  
  var url = API_ENDPOINT;
  
  return fetch(url, { method: 'POST', headers: myHeaders, body: { query: myQuery } } )
    .then(response => response.json())
    .then(data => ({
      statusCode: 200,
      headers: {"content-type": "application/json"},
      body: data
    }))
    .catch(error => ({ statusCode: 422, body: String(error) + params.token }));
};
