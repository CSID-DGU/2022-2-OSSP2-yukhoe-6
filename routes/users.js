var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
var Post = require('../models/Post');
var StudyRoom = require('../models/StudyRoom');
const { promisifyAll } = require('bluebird');

// New
router.get('/new', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user:user, errors:errors });
});

// create
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/');
  });
});

// mypage
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){

  Promise.all([
    User.findOne({username:req.params.username}),
    StudyRoom.findOne({"leader.username": req.params.username}).sort('date').populate({ path: 'leader', select: 'username' }),
    Post.find({"author":req.user.id})
  ])
  .then(([user, rooms,post]) => {
    console.log(rooms);
    console.log("작성한 글 목록");
    console.log(post);
    res.render('users/mypage', { user:user, room:rooms,post:post});

  })
});

// edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, function(err, user){
      if(err) return res.json(err);
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  }
  else {
    res.render('users/edit', { username:req.params.username, user:user, errors:errors });
  }
});

// update
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next){
  User.findOne({username:req.params.username})
    .select('password')
    .exec(function(err, user){
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(var p in req.body){
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function(err, user){
        if(err){
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
  });
});


// studyroom
router.get('/:username/studyroom', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  var rooms = [];
  
  Promise.all([
    //leader의 username에 해당하는 user를 populate로 user 객체로 만들어서 필드로 가져옴 
    User.findOne({username:req.user.username})
  ])
  .then(([user_]) => {
    var studyroom_title = user_.studyrooms;

    studyroom_title.forEach(title_ => {
      Promise.all([
        StudyRoom.findOne({_id:title_})
      ])
      .then(([room]) =>{
        console.log( room);
        rooms.push(room);
        
      });
    });
    console.log("rooms길이: "+rooms.length);
      res.render('users/studyroom', { username:req.params.username, rooms:rooms, errors:errors });
  })
  .catch((err) => {
    return res.json(err);
  });
  
});


module.exports = router;

// private functions
function checkPermission(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    if(user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}
