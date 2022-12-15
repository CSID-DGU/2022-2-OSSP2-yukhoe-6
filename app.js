var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();
var cookieParser = require('cookie-parser');
var pugParser = require('pug-parser');

app.use("/public", express.static(__dirname + "/public"));
app.set("views", __dirname + "/views"); // 디렉토리 설정
app.use(cookieParser());


var checkReject = false;



//roomObjArr 현재 사람이 들어가있어서 생성된방 
let roomObjArr = [
  // {
  //   roomName,
  //   currentNum,
  //   users: [
  //     {
  //       socketId,
  //       nickname,
  //     },
  //   ],
  // },
];

//DB
var StudyRoom = require('./models/StudyRoom.js');

//DB상의 전체방 
let allRoomArr = [
  // [방이름,인원수=초기값0]
]

StudyRoom.find(function(error,studyRooms){
  if (error){console.log(error);}
  else {
    studyRooms.forEach(room=>{
      allRoomArr.push([room.title,0])
    })
    
  }
})


module.exports = allRoomArr;






//스터디룸 목록에서 현재 참여인원을 출력하기 위해 배열을 모듈화해서 밖으로뺌
//let roomObjArr = require("./public/js/roomObjArr.js");



//mongodb와 node.js 연동
mongoose
  .connect(
    'mongodb+srv://jidam123:123jidam@coogledb.jidgxr7.mongodb.net/test',
    {
      // useNewUrlPaser: true,
      // useUnifiedTofology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    }
  )
  .then(() => console.log('MongoDB conected'))
  .catch((err) => {
    console.log(err);
  });


// Other settings

//multiple template engine 
var cons = require('consolidate');
app.engine('ejs',cons.ejs);
app.engine('pug',cons.pug);
//set ejs as default 
app.set('view engine', 'ejs');


app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize()); //passport 초기화 
app.use(passport.session()); //passport랑 session 연결 


var current_user;
// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated(); //로그인이 되어있는지 확인하는 
  
  res.locals.currentUser = req.user; //해당 로그인되어 있는 유저 
  res.locals.util = util;
  next();
});


// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));
app.use('/files', require('./routes/files'));
app.use(`/competitions`,require(`./routes/competitionRouter`));

//스터디룸 roomObjArr전달 ?
app.use('/studies',require('./routes/studyRoom'));



//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


// // server.js

const http = require(`http`);
const WebSocket = require(`ws`);
const {Server} = require(`socket.io`);
const { forEach } = require('pug-parser/lib/inline-tags');
const { all } = require('./routes/home');

//import { instrument } from "@socket.io/admin-ui";


const handleListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, handleListen); // 3000번 포트와 연결

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);
httpServer.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!

//방목록 
// let roomObjArr = [
//   // {
//   //   roomName,
//   //   currentNum,
//   //   users: [
//   //     {
//   //       socketId,
//   //       nickname,
//   //     },
//   //   ],
//   // },
// ];


//방 최대인원 
let max = 4;

//서버는 접속 후 on으로 등록된 이벤트들을 처리함 
wsServer.on("connection", socket => {

  //이게뭐징
   socket["nickname"] = "Anonymous";
   socket.onAny((event) => { 
       console.log(`Socket Event:${event}`)
   })
   //


   //--
   let myRoomName = null;
   let myNickName = null;
   //--

    //join_room 이벤트 처리 
    socket.on("join_room", (roomName,nickname,maximum) => {

        //-- 

        //최대인원 정수로 변환해서 사용하기위함
        max = Number(maximum);
        console.log(`최대 인원 : ${max}명인 방에 입장`);


        myRoomName = roomName;
        myNickName = nickname;

        //방이 존재하는지 
        let isRoomExist = false;
        //접속할 방 
        let targetRoomObj = null;

        // forEach를 사용하지 않는 이유: callback함수를 사용하기 때문에 return이 효용없음.
    for (let i = 0; i < roomObjArr.length; ++i) { 
      //목록에 있는 방 
      if (roomObjArr[i].roomName === roomName) {
        // Reject join the room   방 꽉참 
        if (roomObjArr[i].currentNum >= max) {
          socket.emit("reject_join");
          //방인원
          checkReject = true;
          
          return;
        }
        // 방 꽉 안참 
        isRoomExist = true;
        // 목록에 있는 내가들어가려는 방을 targetRoomObj로 설정 
        targetRoomObj = roomObjArr[i];
        break;
      }
    }

    // Create room 방이없을경우 
    if (!isRoomExist) {
      //방 생성 targetRoomObj 
      targetRoomObj = {
        roomName,
        currentNum: 0,
        users: [],
      };
      // 방 목록에 넣음 
      roomObjArr.push(targetRoomObj);
      //allRoomArr.push([roomName,0]);
    }


    //Join the room 대상 방의 users 키값에 socket.id랑 닉네임 넣음 
    targetRoomObj.users.push({
      socketId: socket.id,
      nickname,
    });
    //방 인원수 1증가 
    ++targetRoomObj.currentNum;

    //>>>>>추가
    allRoomArr.forEach(room=>{
      if (room[0]===targetRoomObj.roomName){
        room[1]+=1;
      }
    })

    //방에 join
    socket.join(roomName);
    //새로 연결된 브라우저에게 accept_join emit함 
    socket.emit("accept_join", targetRoomObj.users);

    //방의 모든 유저들에게 각자의 배열에 방 유저들을 추가할 수 있는 코드를 만들어주자


    //--
    });


    //--roomName에 보내는거에서 변경 
    socket.on("offer", (offer, remoteSocketId, localNickname) => { // offer이벤트가 들어오면, roomName에 있는 사람들에게 offer 이벤트를 전송하면서 offer를 전송한다.
      //--
      socket.to(remoteSocketId).emit(`offer`,offer,socket.id,localNickname);  
      //socket.to(roomName).emit("offer", offer);
    });

  //--roomName에 보내는거에서 변경 
    socket.on("answer", (answer, remoteSocketId) => {
      //socket.to(roomName).emit("answer", answer);
      socket.to(remoteSocketId).emit(`answer`,answer,socket.id);
    });

    //--roomName에 보내는거에서 변경 
    socket.on("ice", (ice, remoteSocketId) => {
        //socket.to(roomName).emit("ice", ice);
        socket.to(remoteSocketId).emit(`ice`,ice,socket.id);
    });


    //채팅 roomName 애들한테 채팅 보냄
    socket.on("chat", (message, roomName) => {
      socket.to(roomName).emit("chat", message);
    });
  
    //연결해제
    socket.on("disconnecting", () => {
      //내 room의 다른 사용자들에게 leave_room emit함 내 socket.id랑 nickname 보내줌 
      socket.to(myRoomName).emit("leave_room", socket.id, myNickName, checkReject);
      
  

      let isRoomEmpty = false;
      

      for (let i = 0; i < roomObjArr.length; ++i) {
        //방목록에 방 있는경우 
        if (roomObjArr[i].roomName === myRoomName) {
          const newUsers = roomObjArr[i].users.filter(
            (user) => user.socketId != socket.id
          );
          //방에 유저목록 업데이트 해주고 유저수 1명 줄임 
          //roomObjArr[i].users = newUsers;
          //--roomObjArr[i].currentNum;
          
          //>>>>>추가 
          //reject_join 이후 방을 나갈 때는 현재 인원수 감소시키면 안됨 
          if (!checkReject){
            allRoomArr.forEach(room=>{
              if (roomObjArr[i].roomName===room[0]){
                room[1]-=1;

                //방에 유저목록 업데이트 해주고 유저수 1명 줄임 
              roomObjArr[i].users = newUsers;
              --roomObjArr[i].currentNum;
              }
            })
          }

          //다시 초기화 
          checkReject = false;
          
  
          //0명되면 빈방 
          if (roomObjArr[i].currentNum == 0) {
            isRoomEmpty = true;
          }
        }
      }
      

      // Delete room 내가 나가면서 방이 비게 되면 삭제함 
      if (isRoomEmpty) {
        const newRoomObjArr = roomObjArr.filter(
          (roomObj) => roomObj.currentNum != 0
        );
        roomObjArr = newRoomObjArr;
      }
    });

});