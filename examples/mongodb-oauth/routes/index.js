var express = require('express');
var router = express.Router();
let User = require('../models/user')
let OAuthClient = require('../models/OAuthClient')

var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response
var authenticate = require('../components/oauth/authenticate')

let oauth = new oauthServer({
    model: require("../utilities/oAuthModels")
})

 router.post('/authorise', function(req, res){
    var request = new Request(req);
    var response = new Response(res);

    return oauth.authorize(request, response).then(function(success) {
      //  if (req.body.allow !== 'true') return callback(null, false);
      //  return callback(null, true, req.user);
        res.json(success)
    }).catch(function(err){
      res.status(err.code || 500).json(err)
    })
  });


router.post('/oauth/token', function(req,res,next){
  console.log('hello1')
  var request = new Request(req);
  var response = new Response(res);

  oauth
    .token(request,response)
    .then(function(token) {
      // Todo: remove unnecessary values in response
      console.log('hello2')
      return res.json(token)
    }).catch(function(err){
      console.log('hello3')
      return res.status(500).json(err)
    })
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

router.post('/authorise', function(req, res){
  
    var request = new Request(req);
    var response = new Response(res);
    
    return oauth.authorize(request, response).then(function(success) {
        res.json(success)
    }).catch(function(err){
      res.status(err.code || 500).json(err)
    })
  });

router.get('/me', authenticate(), function(req,res){
  res.json({
    me: req.user,
    messsage: 'Authorization success, Without Scopes, Try accessing /profile with `profile` scope',
    description: 'Try postman https://www.getpostman.com/collections/37afd82600127fbeef28',
    more: 'pass `profile` scope while Authorize'
  })
});

router.get('/profile', authenticate({scope:'profile'}), function(req,res){
  res.json({
    profile: req.user
  })
});



router.get('/')

router.post('/oauth-test', function(req,res){
    var request = new Request(req);
    var response = new Response(res);

    return oauth.authorize(request, response).then(function(success) {
        res.json(success)
    }).catch(function(err){
      res.status(err.code || 500).json(err)
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

router.get('/oauth-client', function(req,res){
    res.render('oAuthClient')
})

router.post('/api/oauth-client-signup', function(req,res){
  let newClient = OAuthClient(req.body)

  newClient.save(function(err, client){
    if(err) throw err;
    res.json(client)
  })
})
module.exports = router;
