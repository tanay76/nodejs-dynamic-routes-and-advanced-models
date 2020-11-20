const crypto = require('crypto');
const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth: {
//     api_key: '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'
//   }
// }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ourblogpost3476@gmail.com',
    pass: '.jainitai'
  }
});

exports.getLogin = (req, res, next) => {
  let message1 = req.flash('error');
  let message2 = req.flash('success');
  if (message1.length > 0) {
    message1 = message1[0];
  } else {
    message1 = null;
  }
  if (message2.length > 0 ) {
    message2 = message2[0];
  } else {
    message2 = null;
  }
  res.render('auth/login', {
    pageTitle: 'Log In',
    path: '/login',
    errorMessage: message1,
    successMessage : message2,
    oldInput: {
      email: '',
      password: ''
    }
  });
};

exports.getSignup = (req, res, next) => {
  let message1 = req.flash('error');
  let message2 = req.flash('success');
  if (message1.length > 0) {
    message1 = message1[0];
  } else {
    message1 = null;
  }
  if (message2.length > 0 ) {
    message2 = message2[0];
  } else {
    message2 = null;
  }
  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    path: '/signup',
    errorMessage: message1,
    successMessage: message2,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
};

exports.postSignup = (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userConfirmPassword = req.body.confirmPassword;
  if (userPassword !== userConfirmPassword) {
    req.flash('error', 'Passwords Mismatch!');
    res.render('auth/signup', {
      pageTitle: 'Sign Up',
      path: '/signup',
      errorMessage: req.flash('error')[0],
      successMessage: null,
      oldInput: {
        email: userEmail,
        password: userPassword,
        confirmPassword: userConfirmPassword
      }
    });
  } else {
    User.findOne({email: userEmail})
    .then(user => {
      if (user) {
        req.flash('error', 'Email has already been used!')
        return res.render('auth/signup', {
          pageTitle: 'Sign Up',
          path: '/signup',
          errorMessage: req.flash('error')[0],
          successMessage: null,
          oldInput: {
            email: userEmail,
            password: userPassword,
            confirmPassword: userConfirmPassword
          }
        });
      }
      return bcrypt.hash(userPassword, 12)
      .then(hashedPassword => {
        crypto.randomBytes(32, (err, buffer) => {
          if (err) {
            req.flash('error', 'Something wrong! Please contact us.');
            return res.render('auth/signup', {
              pageTitle: 'Sign Up',
              path: '/signup',
              errorMessage: req.flash('error')[0],
              successMessage: null,
              oldInput: {
                email: userEmail,
                password: userPassword,
                confirmPassword: userConfirmPassword
              }
            });
          }
          const token = buffer.toString('hex');
          const user = new User({
            email: userEmail,
            password: hashedPassword,
            activationToken: token,
            isActive: false,
            resetToken: undefined,
            resetTokenExpiration: undefined,
            cart: {items: []}
          });
          return user.save(err => {
            if(!err) {
              transporter.sendMail({
                to: userEmail,
                from: 'ourblogpost3476@gmail.com',
                subject: 'Account Activation Email',
                html: `
                <p>Thank you for subscribing to our site.</p>
                <p>Please, click this <a href = "http://localhost:3000/activate/activation/${token}">link</a> to activate your account and then login.</p>
                `
              });
              // console.log('Email sent successfully to ' + userEmail);
              req.flash('success', 'An activation mail has been sent to your email. Your account will not be activated unless you click on the link provided with the mail!')
              return res.redirect('/');
            }
            req.flash('error', 'User could not be saved');
            res.render('auth/signup', {
              pageTitle: 'Sign Up',
              path: '/signup',
              errorMessage: req.flash('error')[0],
              successMessage: null,
              oldInput: {
                email: userEmail,
                password: userPassword,
                confirmPassword: userConfirmPassword
              }
            });
          });
        });
      })
      .catch(err => {
        console.log('COULD NOT SAVE THIS NEW USER: ', err);
        res.render('auth/signup', {
          pageTitle: 'Sign Up',
          path: '/signup',
          errorMessage: message1,
          successMessage: message2,
          oldInput: {
            email: userEmail,
            password: userPassword,
            confirmPassword: userConfirmPassword
          }
        });
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
      res.render('auth/login', {
        path: '/login',
        pageTitle: 'Log In',
        errorMessage: req.flash('error')[0],
        successMessage: null,
        oldInput: {
          email: userEmail,
          password: userPassword
        }
      });
    } else if (user.isActive === false) {
      req.flash('error', 'You have not yet activated your account through the link sent to your email');
      res.render('auth/login', {
        path: '/login',
        pageTitle: 'Log In',
        errorMessage: req.flash('error')[0],
        successMessage: null,
        oldInput: {
          email: userEmail,
          password: userPassword
        }
      });
    } else {
      bcrypt.compare(userPassword, user.password)
      .then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save();
          req.flash('success', 'Successfully logged in!')
          return res.redirect('/');
        }
        req.flash('error', 'Invalid Password!');
        res.render('auth/login', {
          path: '/login',
          pageTitle: 'Log In',
          errorMessage: req.flash('error')[0],
          successMessage: null,
          oldInput: {
            email: userEmail,
            password: userPassword
          }
        });
      })
    }
  })
  .catch(err => {
    console.log('WRONG PASSWORD ENTERED: ', err);
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Log In',
      errorMessage: null,
      successMessage: null,
      oldInput: {
        email: userEmail,
        password: userPassword
      }
    });
  });
}

exports.getActivated = (req, res, next) => {
  const token = req.params.token;
  User.findOne({activationToken: token})
  .then(user => {
    if (!user) {
      req.flash('error', 'You have perhaps clicked on wrong link!');
      return res.redirect('/signup');
    }
    req.flash('success', 'Right you are! You are almost done!')
    res.render('auth/activation-login', {
      pageTitle: 'Log In',
      path: '/activation-login',
      errorMessage: null,
      successMessage: req.flash('success')[0],
      userId: user._id.toString(),
      oldInput: {
        email: '',
        password: ''
      }
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postActivate = (req, res, next) => {
  const userId = req.body.userId;
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  let activatedUser;
  User.findOne({_id: userId})
  .then(user => {
    if(!user) {
      req.flash('error', 'No such active or inactive users found!');
      res.render('auth/activation-login', {
        pageTitle: 'Log In',
        path: '/activation-login',
        errorMessage: req.flash('error')[0],
        successMessage: null,
        userId: null,
        oldInput: {
          email: userEmail,
          password: userPassword
        }
      });
    } else {
      activatedUser = user;
      if (user.email !== userEmail) {
        req.flash('error', 'No such email is found!');
        res.render('auth/activation-login', {
          pageTitle: 'Log In',
          path: '/activation-login',
          errorMessage: req.flash('error')[0],
          successMessage: null,
          userId: user._id.toString(),
          oldInput: {
            email: userEmail,
            password: userPassword
          }
        });
      } else {
        bcrypt.compare(userPassword, user.password)
        .then(doMatch => {
          if (doMatch) {
            activatedUser.isActive = true;
            return activatedUser.save()
            .then(result => {
              req.session.isLoggedIn = true;
              req.session.user = user;
              req.session.save();
              req.flash('success', 'You are now activated and logged in!')
              res.redirect('/');
            })
            .catch(err => {
              console.log(err);
            });
          } 
          req.flash('error', 'Invalid Password!');
          res.render('auth/activation-login', {
            pageTitle: 'Log In',
            path: '/activation-login',
            errorMessage: req.flash('error')[0],
            successMessage: null,
            userId: user._id.toString(),
            oldInput: {
              email: userEmail,
              password: userPassword
            }
          });
        })
      }
    }
  })
  .catch(err => {
    console.log(err);
  });
}

exports.getResetPassword = (req, res, next) => {
  return res.render('auth/reset-password', {
    pageTitle: 'Reset Password',
    path: 'reset-password',
    errorMessage: null,
    oldInput: {
      email: ''
    }
  });
};

exports.postResetPassword = (req, res, next) => {
  const userEmail = req.body.email;
  let resetUser;
  User.findOne({email: userEmail})
  .then(user => {
    if (!user) {
      req.flash('error', 'No user with this email exists!');
      return res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        path: 'reset-password',
        errorMessage: req.flash('error')[0],
        oldInput: {
          email: userEmail
        }
      });
    }
    if (!user.isActive) {
      req.flash('error', 'You are not active! First activate your account.');
      return res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        path: 'reset-password',
        errorMessage: req.flash('error')[0],
        oldInput: {
          email: userEmail
        }
      });
    }
    resetUser = user;
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        req.flash('error', 'Something wrong! Please contact us.');
        return res.render('auth/reset-password', {
          pageTitle: 'Reset Password',
          path: '/error-message',
          errorMessage: req.flash('error')[0],
          oldInput: {
            email: userEmail
          }
        });
      }
      const token = buffer.toString('hex');
      resetUser.resetToken = token;
      resetUser.resetTokenExpiration = Date.now() + 1800000;
      return resetUser.save(err => {
        if (!err) {
          req.flash('success', 'Please, click on the link sent to your email. link will remain active for 30 minutes.')
          res.redirect('/');
          transporter.sendMail({
            to: userEmail,
            from: 'ourblogpost3476@gmail.com',
            subject: 'Password Reset',
            html: `
            <p>Thank you for subscribing to our site.</p>
            <p>Please, click this <a href = "http://localhost:3000/new-password/${token}">link</a> to reset your password.</p>
            `
          });
        } else {
          console.log('Error in saving resetUser: ', err);
        }
      });
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getNewPassword = (req, res, next) => {
  const resetToken = req.params.token;
  User.findOne({resetToken: resetToken})
  .then(user => {
    if(!user) {
      req.flash('error', 'You have perhaps clicked on wrong link!');
      return res.render('auth/new-password', {
        pageTitle: 'New Password',
        path: '/new-password',
        userId: null,
        resetToken: null,
        errorMessage: req.flash('error')[0],
        oldInput : {
          password: '',
          confirmPassword: ''
        }
      });
    }
    return res.render('auth/new-password', {
      pageTitle: 'New Password',
      path: '/new-password',
      userId: user._id.toString(),
      resetToken: resetToken,
      errorMessage: null,
      oldInput : {
        password: '',
        confirmPassword: ''
      }
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postNewPassword = (req, res, next) => {
  let resetUser;
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  const newPassword = req.body.password;
  const newConfirmPassword = req.body.confirmPassword;
  User.findOne({_id: userId, resetToken: resetToken, resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
    if(!user) {
      req.flash('error', 'Your time for password renewal has expired! Please, try again.');
      return res.render('auth/new-password', {
        pageTitle: 'New Password',
        path: '/new-password',
        userId: null,
        resetToken: null,
        errorMessage: req.flash('error')[0],
        oldInput : {
          password: newPassword,
          confirmPassword: newConfirmPassword
        }
      });
    }
    if (newPassword !== newConfirmPassword) {
      req.flash('error', 'Passwords mismatch!');
      return res.render('auth/new-password', {
        pageTitle: 'New Password',
        path: '/new-password',
        userId: userId,
        resetToken: resetToken,
        errorMessage: req.flash('error')[0],
        oldInput : {
          password: newPassword,
          confirmPassword: newConfirmPassword
        }
      });
    }
    bcrypt.hash(newPassword, 12)
    .then(hashedPassword => {
      resetUser = user;
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      resetUser.save();
      req.flash('success', 'Password changed successfully.');
      return res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err);
  });
};


exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};