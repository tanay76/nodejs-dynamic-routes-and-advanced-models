const chalk = require('chalk');

exports.get404Page = (req, res, next) => {
  res.render('404', {
    pageTitle:'404 Page', 
    path:'',
    isAuthenticated: req.session.isLoggedIn
  });
};