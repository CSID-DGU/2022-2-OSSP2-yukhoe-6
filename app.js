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

const http = require(`http`);
const WebSocket = require('ws');
const {Server} = require('socket.io');
//import { instrument } from "@socket.io/admin-ui";




const handleListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, handleListen); // 3000번 포트와 연결

const httpServer = http.createServer(app); // app은 requestlistener 경로 - express application으로부터 서버 생성
const wsServer = new Server(httpServer); // localhost:3000/socket.io/socket.io.js로 연결 가능 (socketIO는 websocket의 부가기능이 아니다!!)

//받아온 input_value를 이용해서 소켓에 접속함 
wsServer.on(`connection`,socket=>{
  //클라이언트 사이드에서 등록한 이벤트 처리 , join_room이벤트, 받아온 roomName, done은 함수 받아온거같은데 정확하지않음
  socket.on(`join_room`,(roomName,done)=>{
    socket.join(roomName);
    done(); //done을 이용해서 받아온 함수 호출한듯??

    //특정 룸에 welcome 이벤트 보내기 
    socket.to(roomName).emit(`welcome`);
  })

  //서버에서 offer를 처리하는 코드 
  socket.on(`offer`,(offer,roomName)=>{
    //offer 이벤트가 발생하면 roomName의 사람들에게 offer 이벤트(이벤트명) 발생, offer (초대장)담아서 보냄 
    socket.to(roomName).emit(`offer`,offer);
  });
})

httpServer.listen(3000,handleListen);
// 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!


