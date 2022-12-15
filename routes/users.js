var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
var StudyRoom = require('../models/StudyRoom');
const { promisifyAll } = require('bluebird');
var Post = require('../models/Post');

//인원수출력하기위함
let allRoomArr = require("../app.js");
const { compareDocumentPosition } = require('domutils');

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
    res.redirect('/login');
  });
});

// mypage
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  var rooms = [];
  
  Promise.all([
    //leader의 username에 해당하는 user를 populate로 user 객체로 만들어서 필드로 가져옴 
    User.findOne({username:req.user.username}),
    Post.find({"author":req.user.id})
  ])
  .then(([user,post]) => {
    var studyroom_title = user.studyrooms;

    studyroom_title.forEach(title_ => {
      Promise.all([
        StudyRoom.findOne({_id:title_})
      ])
      .then(([room]) =>{
        if(room ==null){
          user.studyrooms.splice(user_.studyrooms.indexOf(title_), 1);
          user.save();
        }else{
          rooms.push(room);
          console.log(room);
        }
        console.log("rooms길이: "+rooms.length);
        //{ username:req.params.username, rooms:rooms, errors:errors }
        
        
         if (title_ === studyroom_title[studyroom_title.length - 1]){ 
          res.render('users/mypage', {user:user, post:post, rooms : rooms, allRoomArr : allRoomArr, nickName : req.user.username});
      }
      
      })
      .catch((err) => {
        //return res.json(err);
      });
  }
  
  )
  if(studyroom_title.length ==0){
    res.render('users/mypage', {user:user, post:post, rooms : rooms, allRoomArr : allRoomArr, nickName : req.user.username});

  }
}).catch((err) => {
  //return res.json(err);
});
});

//delete submit 
router.post('/:username/delete/submit', util.isLoggedin, checkPermission, function(req, res){

  Promise.all([
    User.findOne({username:req.params.username})
    
  ])
  .then(([user]) => {
    Promise.all([
      StudyRoom.deleteMany({leader: user._id}),
      Post.deleteMany({author : user._id}),
      User.deleteOne({username:req.params.username})
    ])
    .then(([err1, err2, err3]) => {
      if(err1){
        console.log(err1);
      }else{
        console.log(`스터디룸 삭제 성공`);
      }

      if(err2){
        console.log(err2);
      }else{
        console.log(`게시물 삭제 성공`);
      }

      if(err1){
        console.log(err3);
      }else{
        console.log(`최종 계정 삭제 성공`);
      }

      res.redirect('/');
    })
    
  })

  
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