const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    trim: true,
    minLength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true
  },
  tokens: [{
    access: {
      type: String,
      required: true
    }, 
    token: {
        type: String,
        required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function () {
  var user =this;
  var acces = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({acces, Token});

  return user.save().then(() => {
    return token;
  })
}

User.statics.findByToken = function (token) {
  var User = this;
  var decoded;
  
  try {
    decoded =jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {

};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
  
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
