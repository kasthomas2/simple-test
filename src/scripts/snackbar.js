/*
To use this, just put an empty <div id="snackbar"></div>
in the page somewhere, include the .css (see styles.css),
and call this function to pop the toast. 

The optional 2nd arg makes the toast red.
*/

function showSnackbar( msg, err ) {
  
  let ERROR_COLOR = "#e25";
  let SNACK_DURATION = 3500;
  
  var x = document.getElementById("snackbar");
  x.innerText = msg;
  x.className = "show"; 
  var originalBackgroundColor = x.style["background-color"];
  if ( err )
    x.style["background-color"] = ERROR_COLOR;
  
  setTimeout(function(){ 
    x.className = x.className.replace("show", ""); 
    x.style["background-color"] = originalBackgroundColor;
  }, SNACK_DURATION );
}

