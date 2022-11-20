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


//서버는 접속 후 on으로 등록된 이벤트들을 처리함 
wsServer.on("connection", socket => {
    //join_room 이벤트 처리 
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome"); // 특정 룸에 이벤트 보내기
    });

    socket.on("offer", (offer, roomName) => { // offer이벤트가 들어오면, roomName에 있는 사람들에게 offer 이벤트를 전송하면서 offer를 전송한다.
        socket.to(roomName).emit("offer", offer);
    });

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })
});

