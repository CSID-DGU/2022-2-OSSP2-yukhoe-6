var express  = require('express');
var router = express.Router();
var util = require('../util');
var http = require("http");

router.get(`/`,function(req,res){
    res.render(`studyRooms/home.pug`);  
});


module.exports=router;