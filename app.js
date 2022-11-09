// express 모듈 import 
var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public')); //해당 디렉터리에 있는 데이터들을 요청에 따라 제공할 수 있다.

//body-parser || use() 메소드는 모든 요청을 받아들임.
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true})); //post 방식 세팅
app.use(bodyParser.json()); //json 사용하는 경우 세팅

//cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

//화면 engine을 ejs로 설정
app.set('view engine', 'ejs');

// _method의 query로 들어오는 값으로 HTTP method를 바꾼다. 
// ex: http://example.com/category/id?_method=delete를 받으면 해당 requestdml HTTP method를 delete로 바꿈
var methodOverride = require('method-override');
app.use(methodOverride('_method'));

//mysql
var mysql = require('mysql') ;   //import mysql


//--------------------세션등록---------------------// 
//session
var expressSession = require('express-session');
//세션 환경 세팅
//세션은 서버쪽에 저장하는 것을 말하는데, 파일로 저장 할 수도 있고 레디스라고 하는 메모리DB등 다양한 저장소에 저장 할 수가 있는데
app.use(expressSession({
  secret: 'my key',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐
                              //아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
  resave: true,
  saveUninitialized:true
}));
//--------------------세션등록---------------------//


//routers.
const homeRouter = require('./routes/homeRouter');
const loginRouter = require('./routes/loginRouter');
const postRouter = require('./routes/postRouter');
<<<<<<< HEAD
const competitionRouter = require(`./routes/competitionRouter`);
=======

//공모전라우터 
const competitionRouter = require(`./routes/competitionRouter`);

>>>>>>> master

//homeRouter.js는 앞으로 '/'경로로 오는 라우터를 관리할 것이다. 
app.use('/', homeRouter);
app.use('/', loginRouter);
//app.use('/community', communityRouter);
app.use('/posts', postRouter)
//app.use('/coogle/competitions',competitionRouter);

//공모전라우터 url경로
app.use('/competitions', competitionRouter);


const port = 3000;
const server = app.listen(port, function() { //서버 실행
    console.log('Listening on '+port);
    console.log('server is running')
    
});
app.get("/", function(req, res){
    res.send("fxxk you world!")
});



//mongodb와 node.js 연동
const mongoose = require('mongoose');
mongoose
  .connect(
    //지성님이 aws에 올린 mongodb 서버 주소, 이거 쓰려면 지성님이 ip주소 추가해줘야함 
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
