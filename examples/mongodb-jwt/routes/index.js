var express = require('express');
var router = express.Router();
let User = require('../models/user')
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');


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

router.get('/get-jwt',
  function(req, res) {
    res.send(token)
  }
);

router.post('/test-jwt',
  function(req, res) {
    let token = req.headers.authorization
    jwt.verify(token, 'shhhhh', function(err, decoded) {
     res.send(decoded) // bar
    });
  }
);

router.get('/signup', function(req,res){
  res.render('signup')
})

router.get('/login', function(req,res){
  res.render('login')
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


router.post('/api/login', function(req,res, next){
  console.log('login')
  let user = User.findOne(
    {username: req.body.username},
    function(err,user){
      if(err) throw err;
      if(!user) next({message: 'cannot find user'});
      if(user){
        user.comparePassword(req.body.password, function(matchErr, isMatch){
          if (matchErr) throw matchErr;
          if (!isMatch) next({message: 'password fail'});
          if (isMatch) res.send('success')
        })
      }
    }
  )
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


// Error Handler for all failed request
router.use('*', function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send(err.message)
})


module.exports = router;
