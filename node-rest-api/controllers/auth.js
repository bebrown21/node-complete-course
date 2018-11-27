const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors) {
    const error = new Error('Validation Failed!');
    error.statusCode = 422;
    error.data = validationErrors.array();
    throw error; 
  } 
  bcrypt.hash(req.body.password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: req.body.email,
        name: req.body.name,
        password: hashedPassword
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User Created!',
        userId: result._id
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.login = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        const error = new Error('This Email could not be found!');
        error.statusCode = 401;
        throw error;
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Password is not correct!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign({
        email: fetchedUser.email,
        userId: fetchedUser._id.toString()
      }, 
      'secret', 
      { expiresIn: '1h'});
      res.status(200).json({
        token: token,
        userId: fetchedUser._id.toString()
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}