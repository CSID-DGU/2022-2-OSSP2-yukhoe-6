var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();

app.use("/public", express.static(__dirname + "/public"));
app.set("views", __dirname + "/views"); // 디렉토리 설정





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

// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
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
app.use('/studies',require('./routes/studyRoom'));


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// server.js

const http = require(`http`);
const WebSocket = require(`ws`);
const {Server} = require(`socket.io`);

//import { instrument } from "@socket.io/admin-ui";


const handleListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, handleListen); // 3000번 포트와 연결

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);
httpServer.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!

//방목록 
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

//방 최대인원 
const MAXIMUM = 4;

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



  //  //지성 
  //  socket.on("enter_room", (roomName, done) => {
  //      // console.log(socket.rooms); // 현재 들어가있는 방을 표시 (기본적으로 User와 Server 사이에 private room이 있다!)
  //       socket.join(roomName);
  //       // console.log(socket.rooms);  // 앞은 id, 뒤는 현재 들어가있는 방
  //       done();
  //      socket.to(roomName).emit("welcome", socket.nickname) // welcome 이벤트를 roomName에 있는 모든 사람들에게 emit한 것
  //   });
  //  socket.on("disconnecting", () => { // 클라이언트가 서버와 연결이 끊어지기 전에 마지막 굿바이 메시지를 보낼 수 있다!
  //       socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname)); // 방안에 있는 모두에게 보내기 위해 forEach 사용!
  //   })
  //  socket.on("new_message", (msg, room, done) => { // 메세지랑 done 함수를 받을 것
  //      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`); // new_message 이벤트를 emit한다! 방금 받은 메시지가 payload가 된다!
  //      done(); // done은 프론트엔드에서 코드를 실행할 것!! (백엔드에서 작업 다 끝나고!!)
  //  });
  //  socket.on("nickname", nickname => socket["nickname"] = nickname);
  //  //지성




    //join_room 이벤트 처리 
    socket.on("join_room", (roomName,nickname) => {

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
        if (roomObjArr[i].currentNum >= MAXIMUM) {
          socket.emit("reject_join");
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
    }


    //Join the room 대상 방의 users 키값에 socket.id랑 닉네임 넣음 
    targetRoomObj.users.push({
      socketId: socket.id,
      nickname,
    });
    //방 인원수 1증가 
    ++targetRoomObj.currentNum;

    //방에 join
    socket.join(roomName);
    //방의 user들에게 accept_join emit함 
    socket.emit("accept_join", targetRoomObj.users);

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
      socket.to(myRoomName).emit("leave_room", socket.id, myNickName);
  

      let isRoomEmpty = false;
      

      for (let i = 0; i < roomObjArr.length; ++i) {
        //방목록에 방 있는경우 
        if (roomObjArr[i].roomName === myRoomName) {
          const newUsers = roomObjArr[i].users.filter(
            (user) => user.socketId != socket.id
          );
          //방에 유저목록 업데이트 해주고 유저수 1명 줄임 
          roomObjArr[i].users = newUsers;
          --roomObjArr[i].currentNum;
  
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

