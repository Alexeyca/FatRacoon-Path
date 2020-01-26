var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})
app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + "/" + "style.css");
})
app.get('/script.js', function(req, res) {
  res.sendFile(__dirname + "/" + "script.js");
});


var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("app listening at http://%s:%s", host, port)
})
