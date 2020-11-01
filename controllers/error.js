exports.get404Page = (req, res, next) => {
  res.render('404', {pageTitle:'404 Page', path:''});
};