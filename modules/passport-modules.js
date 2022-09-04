function checkAuthenticated(req, res, next) {
    if (req.user) {
      console.log('wwwefd')
      if (req.isAuthenticated()) {
        return next();
      }
    } else {
      res.redirect('/login')
    }
}
  
function checkNotAuthenticated(req, res, next) {
  console.log('get called')
    if (req.isAuthenticated()) {
      res.redirect('/');
    }
  
    return next();
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
}