var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();
var http = require(`http`);
var WebSocket = require("ws");

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

//3000번 포트와 연결 
const handleListen = () => console.log(`Listening on http://localhost:3000`)

//서버생성 
const server = http.createServer(app)
//http 서버 위에 webSocket 서버 생성 
const wss = new WebSocket.Server({ server });


// 임시로 만든 함수
function handleConnection(socket) { // 여기서 socket은 연결된 브라우저
  console.log(socket) // 여기 있는 소켓이 frontend와 real-time으로 소통할 수 있다!
};


// on method에서는 event가 발동되는 것을 기다린다
// event가 connection / 뒤에 오는 함수는 event가 일어나면 작동
// 그리고 on method는 backend에 연결된 사람의 정보를 제공 - 그게 socket에서 옴
wss.on("connection", socket => { // 여기의 socket이라는 매개변수는 새로운 브라우저를 뜻함!! (wss는 전체 서버, socket은 하나의 연결이라고 생각!!)
  console.log("Connected to Browser ✅");
  socket.on("close", () => console.log("Disconnected to Server ❌")); // 서버를 끄면 동작
  socket.on("message", message => {
      const utf8message = message.toString("utf8"); // 버퍼 형태로 전달되기 때문에 toString 메서드를 이용해서 utf8로 변환 필요!
      console.log(utf8message);
  }); // 프론트엔드로부터 메시지가 오면 콘솔에 출력
  socket.send("hello!!!"); // hello 메시지 보내기 - send는 socket의 전송용 메서드!!
}) // socket을 callback으로 받는다! webSocket은 서버와 브라우저 사이의 연결!!!



server.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!






// Port setting
// var port = 3000;
// app.listen(port, function(){
//   console.log('server on! http://localhost:'+port);
// });

