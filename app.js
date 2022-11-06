var express = require('express');
var app = express();
app.use(express.static(__dirname + '')); //해당 디렉터리에 있는 데이터들을 요청에 따라 제공할 수 있다.

//body-parser || use() 메소드는 모든 요청을 받아들임.
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true})); //post 방식 세팅
app.use(bodyParser.json()); //json 사용하는 경우 세팅

//cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

//화면 engine을 ejs로 설정
app.set('view engine', 'ejs');

//socket

//mysql
var mysql = require('mysql') ;   //import mysql


//routers.
const homeRouter = require('./routes/homeRouter');
//const loginRouter = require('./routes/loginRouter');
const postRouter = require('./routes/postRouter');


//homeRouter.js는 앞으로 '/'경로로 오는 라우터를 관리할 것이다. 
app.use('/', homeRouter);
//app.use('/login', loginRouter);
//app.use('/community', communityRouter);
app.use('/posts', postRouter)


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
    'mongodb+srv://coogle:1234@cluster0.q4juxmy.mongodb.net/?retryWrites=true&w=majority',
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