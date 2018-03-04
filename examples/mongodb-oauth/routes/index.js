var express = require('express');
var router = express.Router();
let User = require('../models/user')

var oauthServer = require('oauth2-server');
var oauthRequest = oauthServer.Request;
var oauthResponse = oauthServer.Response

let oauth = new oauthServer({
    model: require("../models/oauthModel")
})

router.get('/', function(req,res,next){
  res.render('index', {title: 'Express'})
})

router.param('user', function(req,res,next,id){
  var query = User.findById(id)
  query.exec(function(err,data){
    if(err) return next (err);
    if(!data) return next(new Error(`can't find data`))
    req.user = data;
    return next()
  })
})

router.get('/signup', function(req,res){
  res.render('signup')
})

router.post('/api/signup', function(req,res){

  let newUser = User({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    admin: true,
  })

  newUser.save(function(err, user){
    if(err) throw err;
    res.json(user)
  })
})

router.get('/api/users', function(req,res){
  User.find({}, function(err, users){
    if(err) throw err;

    res.json(users);
  })
})

router.get('/api/users/:user', function(req,res){
    User.find({_id: req.user._id}, function(err,user){
      if(err) throw err;

      res.json(user);
    })
})

router.get('/api/delete/:user', function(req,res){
  User.find({_id: req.user._id}).remove().exec()
  res.send('deleted')
})

module.exports = router;
