'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

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

var User = mongoose.model('User', userSchema);

module.exports = User;
