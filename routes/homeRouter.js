var express = require('express');
var router = express.Router();

// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
});
router.route(`/login`).get(
  function(req,res){

      if (req.session.user)  //세션에 유저가 있다면 : 로그인 한 상태 
      {
          console.log('homepage_authorized');
          res.render('logins/homepage_authorized');
          //res.sendFile('../views/logins/homepage_authorized.html');
      }
      else // 로그인 하지 않은 상태 
      {
          console.log('homepage');
          res.render('logins/homepage');
          //res.sendFile('../views/logins/homepage.html');
      }

  }
)
module.exports = router;