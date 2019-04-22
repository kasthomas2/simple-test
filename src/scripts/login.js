  <script>
          let API_ENDPOINT = "https://api.veritone.com/v3/graphql";
      
      var _token = null;
      
      function showMessage( msg ) {
        var messageNode = document.querySelector("#message");
        messageNode.innerHTML = msg;
      }
      
      function login() {
        var username = document.querySelector("#username").value;
        var pw = document.querySelector("#pw").value;     
        loginAndGetToken( username, pw );
      }
      
      function loginAndGetToken( username, pw ) {
      
        var q = 'mutation userLogin { userLogin(input: {userName: "' + username + '" password: "' + pw + '"}) {token}}';
        
        fetch( API_ENDPOINT, {
          body: JSON.stringify({
              "query": q
          }),
          headers: {
              "Content-Type": "application/json"
          },
          method: "POST"
      }).then(function(response) {
          if (!response.ok) {
              alert( "Oops. We got a " + response.status);
              throw new Error("HTTP error, status = " + response.status);
          }
          return response.json();
    
      }).then(json=>{
              if ( !json.data.userLogin ) {
                alert("That log-in didn't work.");
                return;
              }
              _token = json.data.userLogin.token;
              console.log(JSON.stringify(json));
              showMessage("Successful log-in!<br/>Your token is: " + _token);
          });
      } // loginAndGetToken()
    </script>
