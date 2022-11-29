var express  = require('express');
var router = express.Router();
var util = require('../util');
var http = require("http");
var User = require('../models/User');
var util = require('../util');

router.get(`/`,util.isLoggedin,function(req,res){
    res.render(`studyRooms/home.pug`,{nickName:req.user.username});  
    //res.render('competitions/index',{competitions:comp});
});


module.exports=router;