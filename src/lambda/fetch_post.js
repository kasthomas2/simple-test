import querystring from "querystring";
import fetch from "node-fetch";

const API_ENDPOINT = "http://api.plos.org/search?q=";

function applyMarkup(d) {
    var base = "https://journals.plos.org/plosgenetics/article?id=";
    var markup = '<html><body><head><link href="/styles.css" rel="stylesheet"></head><b>Articles: ' + d.response.numFound + "</b><br/><br/>"; 
    markup += d.response.docs.map( i=>['<h4>'+i.title+'</h4>',
        '<p>'+i.abstract+' </p>',
       '<a href="' + base + i.id + '">Article</a><br/>'].join('') ).join('\n');
    markup += '<br/><br/><a href="https://heuristic-panini-8528fb.netlify.com/">Do another search</a></body></html>' ;
    return markup;
}

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Since this is a POST, the topic will be in the event body as a query string
  const params = querystring.parse(event.body);
  var myQuery = encodeURI('title:' + params.topic + '&fl=title,id,abstract&wt=json&indent=on');
  var url = API_ENDPOINT + myQuery;
  
  return fetch(url)
    .then(response => response.json())
    .then(data => ({
      statusCode: 200,
      headers: {"content-type": "text/html"},
      body: JSON.stringify(data).indexOf('"numFound":0')!=-1? 
        "The url that failed was:\n" + url : applyMarkup(data) /* JSON.stringify(data,null,4) */
    }))
    .catch(error => ({ statusCode: 422, body: String(error) }));
};
