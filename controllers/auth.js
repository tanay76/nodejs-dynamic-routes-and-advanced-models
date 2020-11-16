const chalk = require('chalk');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    pageTitle: 'Log In',
    path: '/login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    path: '/signup',
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userConfirmPassword = req.body.confirmPassword;
  if (userPassword != userConfirmPassword) {
    req.flash('error', 'Passwords Mismatch!');
    res.redirect('/signup');
  } else {
    User.findOne({email: userEmail})
    .then(user => {
      if (user) {
        req.flash('error', 'Email has already been used!')
        return res.redirect('/signup');
      }
      return bcrypt.hash(userPassword, 12)
      .then(hashedPassword => {
        const user = new User({
          email: userEmail,
          password: hashedPassword,
          cart: {items: []}
        });
        return user.save(err => {
          if(!err) {
            return res.redirect('/login');
          }
          res.redirect('/signup');
        });
      })
      .catch(err => {
        console.log('COULD NOT SAVE THIS NEW USER: ', err);
        res.redirect('/signup');
      });
    })
  } 
}

exports.postLogin = (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  User.findOne({email: userEmail})
  .then(user => {
    if (!user) {
      req.flash('error', 'Invalid Email');
      return res.redirect('/login');
    }
    bcrypt.compare(userPassword, user.password)
    .then(doMatch => {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(err => {
          if (!err) {
            return res.redirect('/');
          }
          res.redirect('/login');
        });        
      }
      req.flash('error', 'Invalid Password!');
      res.redirect('/login');
    })
  })
  .catch(err => {
    console.log('WRONG PASSWORD ENTERED: ', err);
    res.redirect('/login');
  });
}




exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};