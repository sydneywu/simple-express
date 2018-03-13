var mongoose = require('mongoose');
var bcrypt = require('bcrypt')

// create a schema
var userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  location: String,
  meta: {
    age: Number,
    website: String
  },
  created_at: Date,
  updated_at: Date
});

userSchema.pre('save', function(next){
  var currentDate = new Date();
  this.updated_at = currentDate;
  if(!this.created_at) this.created_at = currentDate;
  next();
})

userSchema.pre('save', function(next){
  let user = this;
  if(this.isModified('password') || this.isNew){
    bcrypt.genSalt(10, function (err, salt){
      if (err){
        return next (err);
      }
      bcrypt.hash(user.password, salt, function(err, hash){
        if (err){
          return next(err);
        }
        user.password = hash;
        next();
      })
    })
  } else {
    return next();
  }
})

userSchema.methods.comparePassword = function (pw, cb){
  bcrypt.compare(pw, this.password, function (err, isMatch){
    if (err){
      return cb(err);
    }
    cb(null, isMatch);
  });
};


var User = mongoose.model('User', userSchema);


module.exports = User;
