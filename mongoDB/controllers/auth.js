const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');
const User = require('../models/user');

const transporter = nodemailer.createTransport(sendGridTransport({
  auth: {
    api_key: 'api-key-goes-here'
  }
}));

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error'),
     previousUserInput: { 
      email: '', 
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: req.flash('error'),
    previousUserInput: { 
      email: '', 
      password: '', 
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422)
      .render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: validationErrors.array()[0].msg,
        previousUserInput: { 
          email: email, 
          password: password
        },
        validationErrors: validationErrors.array()
    });
  }
  User.findOne({ email: email })
    .then(user => {
      bcrypt.compare(password, user.password)
        .then(isMatchingPassword => {
          if (isMatchingPassword) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
            return res.status(422)
              .render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Invalid Password',
                previousUserInput: { 
                  email: email, 
                  password: password
                },
                validationErrors: []
            });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: validationErrors.array()[0].msg,
        previousUserInput: { 
          email: email, 
          password: password, 
          confirmPassword: req.body.confirmPassword 
        },
        validationErrors: validationErrors.array()
    });
  }
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'shop@node-complete-course.com',
        subject: 'Signup Succeeded!',
        html: '<h1>You Successfullying Signed Up!</h1>'
      })
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: req.flash('error')
  });
}

exports.postReset = (req, res, next)=> {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Email was not found!');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 360000;
        user.save();
      })
      .then(result => {
        res.redirect('/login');
        return transporter.sendMail({
          to: req.body.email,
          from: 'shop@node-complete-course.com',
          subject: 'Password Reset!',
          html: `
            <p>You requested a Password Reset</p>
            <p>Click the <a href="http://localhost:3000/reset/${token}">Link</a> to Reset your Password</p>`
        });
      })
      .catch(err => console.log(err));
  })
} 

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: {$gt: Date.now() }})
    .then(user => {
      if (!user) {
        req.flash('error', 'User not found!');
        res.redirect('/new-password');
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Update Password',
        errorMessage: req.flash('error'),
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({ 
    resetToken: passwordToken, 
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.token = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => res.redirect('/login'))
  .catch(err => console.log(err));
}
