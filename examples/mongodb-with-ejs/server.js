var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser')
/***********************/
/***** DB & Models *****/
/***********************/
mongoose.connect('mongodb://localhost/simpleexpress')
require('./models/user')

/***********************/
/***** Main App *****/
/***********************/
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'public')));

// Routes start here
app.use('/', require('./routes/index'));

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = app.listen(8081, function(){
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://localhost:" + port)
})
