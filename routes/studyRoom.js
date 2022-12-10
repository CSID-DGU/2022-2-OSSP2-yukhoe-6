var express  = require('express');
var router = express.Router();
var util = require('../util');
var http = require("http");
var StudyRoom = require('../models/StudyRoom');
var User = require('../models/User');


//인원수출력하기위함
//let allRoomArr = require("../app.js");


//user
//var User = require(`../models/User`);



//인원수출력하기위함
let allRoomArr = require("../app.js");


//로그인 
var passport = require(`../config/passport`);
//공용으로 사용하는 함수들 
var util = require('../util');
const { REPL_MODE_SLOPPY } = require('repl');
const { session } = require('../config/passport');
const { forEach } = require('pug-parser/lib/inline-tags');

var enterRoomName;


router.get(`/`,util.isLoggedin,function(req,res){
    
    StudyRoom.find({})
    .populate('leader') // 1
    .sort('-date')
    .exec(function(err, rooms){
      if(err) return res.json(err);
      
      res.render('studyRooms/index', {rooms : rooms, allRoomArr : allRoomArr});
    });

    
    ///var rooms = [];
    ////// res.render(`studyRooms/index`,{nickName:req.user.username});  
    //res.render('competitions/index',{competitions:comp});
});
router.get(`/create`, util.isLoggedin,function(req,res){
    console.log("스터디방 입력폼");
    var studyroom = req.flash('studyroom')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render(`studyRooms/new`, { studyroom:studyroom, errors:errors });  
    //res.render('competitions/index',{competitions:comp});
});


//req.params.id로 접근가능 
router.get(`/:id`,function(req,res){
    console.log(`방 입장하기 위해 이동`);
   
    Promise.all([
      //leader의 username에 해당하는 user를 populate로 user 객체로 만들어서 필드로 가져옴 
      StudyRoom.findOne({_id:req.params.id}).populate({ path: 'leader', select: 'username' }),
      User.findOne({username:req.user.username}),
    ])
    .then(([room, user]) => {
      user.studyrooms.push(room.title);
      user.save();
      
      res.render('studyRooms/show.pug', { room:room , nickName:req.user.username});
    })
    .catch((err) => {
      return res.json(err);
    });
});



  router.post('/new/submit',util.isLoggedin,function(req,res){
    console.log(`스터디룸 생성`)

    //로그인을 하면 passpport에서 req.user를 만듬 
    //id를 가져와서 author값으로 지정해줌 
    req.body.leader = req.user._id;
    console.log(req.body);
    var roomName = req.body.title;
    
    StudyRoom.create(req.body,function(err,studyroom){
        if (err){
            console.log(`스터디룸 db 생성중 예외발생`);
            req.flash('studyroom', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/studies/create');
        }
        console.log(`스터디룸 db 생성완`);
        console.log("방이름 "+ roomName);
        res.redirect(`/studies`);
    });
});



router.get(`/exit/verify/:time`,util.isLoggedin,function(req,res){

  User.findOne({username:req.user.username},(err,user)=>{
    if (err){
      console.log(`시간 변경중 에러발생`);
      console.log(err);
      
    } else {
      //localStroage is not defined
      //console.log(req.params.time); 
      const addTime = new Number(req.params.time);
      user.time+=addTime;
      user.save((err,modified_user)=>{
        if (err){
          console.log(`시간 변경중 에러발생2`);
          console.log(err);
          console.log(user.time);
          console.log(addTime);
          console.log(req.params.time);
          
        } else{
          //alert(`스터디룸에서 ${localStorage.getItem("time")}만큼 공부했어요!\n이번 달 총 공부시간은 ${modified_user.time}입니다!`);
          res.redirect(`/studies`);
        }
      })
    }
  })
  // console.log(`ddd`);
  // res.redirect(`/studies`)


});

//랭킹표시하기위함
router.get(`/rank/rankings`,(req,res)=>{
  User.find({}).sort(`-time`).exec(function(err,users){
    if (err){
      console.log(`유저 목록 가져오는 도중 예외발생`);
      console.log(err);
    }
    else {
      res.render(`studyRooms/rank`,{users:users});
    }
  })
})


module.exports=router;