var express  = require('express');
var router = express.Router();
var util = require('../util');

var http = require("http");
var WebSocket = require("ws");
const { $where } = require('../models/User');






router.get(`/`,function(req,res){
    //서버로 접속 가능, socket을 이용해 프론트엔드에서 백엔드로 메세지 전송가능 
    const socket = new WebSocket(`ws://localhost:3000/studies`);

    socket.addEventListener("open", ()=>{ // open되면 동작
        console.log("Connected to Server ✅");
    })
    
    socket.addEventListener("message", message => {
        console.log("New message: ", message.data);
    });
    
    socket.addEventListener("close", () => {
        console.log("Disconnected to Server ❌");
    });
    
    setTimeout(() => {
        socket.send("hello from the browser!"); // backend로 메시지 보내기!
    }, 10000); // 10초 후에 작동
    


    res.render(`studyRooms/index`);
    
});











module.exports=router;