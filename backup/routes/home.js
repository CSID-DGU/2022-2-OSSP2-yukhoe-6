var express = require('express');
var router = express.Router();
var passport = require('../config/passport');

// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
});

// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});

// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = '아이디를 입력해주세요!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = '비밀번호를 입력해주세요!';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login'
  }
));

// Logout
router.get('/logout', function(req, res,next) {
    //홈페이지로 리다이렉트 
    res.render('home/logout');
});

//logout에서 yes 누르면
router.post('/logout',
  function(req,res,next){
    req.session.destroy( 
  
      //예외처리 
      function (err) {
        if (err) {  
            throw(err);
        }
  
      //홈페이지로 리다이렉트 
      res.redirect('/');
      }
      );
  });   

module.exports = router;
