var express  = require('express');
var router = express.Router();
var util = require('../util');
var http = require("http");
var StudyRoom = require('../models/StudyRoom');

//로그인 
var passport = require(`../config/passport`);
//공용으로 사용하는 함수들 
var util = require('../util');
const { REPL_MODE_SLOPPY } = require('repl');

var enterRoomName;


router.get(`/`,util.isLoggedin,function(req,res){
    StudyRoom.find({})
    .populate('leader') // 1
    .sort('-date')
    .exec(function(err, rooms){
      if(err) return res.json(err);
      res.render('studyRooms/index', {rooms:rooms});
    });
    ///var rooms = [];
    ////// res.render(`studyRooms/index`,{nickName:req.user.username});  
    //res.render('competitions/index',{competitions:comp});
});
router.get(`/`,util.isLoggedin,function(req,res){
   
    res.render(`studyRooms/show.pug`,{nickName:req.user.username});  
    //res.render('competitions/index',{competitions:comp});
});

//스터디방 참여하기
//req.params.id로 접근가능 
router.get(`/:id`,function(req,res){
    console.log(`자세히보기 접근`);
    //find로 검색해서 하나만 찾아도 [] 리스트에 담아옴 
    StudyRoom.find({_id:req.params.id})
    .populate('leader') //relationship이 있는 필드 생성 
    .exec(function(err,room){
        if (err){
            console.log(`공모전 개별 데이터 불러오는 과정에서 예외발생`);
        }
        console.log(`확인한 개별 데이터`);
        console.log(room);

        res.render(`studyRooms/show.pug`,{studyroom: room, nickName:req.user.username});  
    });
});


       
router.get(`/new`,util.isLoggedin,function(req,res){
    res.render(`studyRooms/new`,{nickName:req.user.username});  
    //res.render('competitions/index',{competitions:comp});
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
            throw err;
        }
        console.log(`스터디룸 db 생성완`);
        res.redirect(`/studies`);
    });
});
module.exports=router;