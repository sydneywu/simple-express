var express = require('express');
var app = express();
var request = require('request');

app.get('/', function(req,res){
  request('http://www.google.com', function(err, response, body){
    console.log('error')
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body);
  })


})

var server = app.listen(8081, function(){
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://localhost:" + port)
})
