// routes/posts.js

var express  = require('express');
var router = express.Router();

//session
var expressSession = require('express-session');







//스키마 객체 가져옴 
//var Profile = require('../model/Login');
var connection = require('../model/Login');
connection.connect();




//홈페이지
// 3000/coogle : get 
router.route(`/coogle`).get(
    function(req,res){

        if (req.session.user)  //세션에 유저가 있다면 : 로그인 한 상태 
        {
            console.log('homepage_authorized');
            res.render('logins/homepage_authorized');
            //res.sendFile('../views/logins/homepage_authorized.html');
        }
        else // 로그인 하지 않은 상태 
        {
            console.log('homepage');
            res.render('logins/homepage');
            //res.sendFile('../views/logins/homepage.html');
        }

    }
)


//회원가입페이지 
// 3000/coogle/signUp : get 
router.route(`/coogle/signUp`).get(
    function(req,res){

        console.log('signUp');
        res.render('logins/signUp');
        //res.sendFile(__dirname + '../views/logins/signUp.html');

    }
)

//회원가입폼에 입력해서 넘어간 페이지 
// 3000/coogle/signUp : post
router.route(`/coogle/signUp/create`).post(
    function(req,res){
        console.log('create');
        console.log(req.body);
        
        //폼 입력 데이터 변수에 저장 
        const name = req.body.name;
        const id = req.body.id;
        const password = req.body.password;
        var incumbent = 0;
        (req.body.incumbent==="TRUE")?incumbent = 1 : incumbent = 0;

        //쿼리문 만들기     
        //db에 쓸 쿼리를 작성할 때는 ${}보다 ?와 리스트로 작성하는 것이 바람직함 
        const qry = 
        `insert into profile (name, id, password, incumbent)
         values(?,?,?,?)`
        const args = [name,id,password,incumbent];

        //DB 연결 
        //connection.connect();

        //query로 위에서 만든 쿼리와 리스트 전달하고 콜백함수 , err로 예외처리, data가 처리된 데이터
        connection.query(qry,args,function(err,data){
            //예외처리
            if (err) {throw err;}
        
            //로그에찍어줌 
            console.log(data);


        });

        //db 연결 종료 
        //connection.end();

        //홈페이지로 리다이렉트 
        res.redirect(`/coogle`);


    }
)


//로그인 폼에 정보 입력해서 넘어간 페이지 
router.route(`/coogle/login`).post(
    function(req,res){
        console.log('login');
        console.log(req.body);
        
        //폼 입력 데이터 변수에 저장 , 로그인할때는 id, pw만 폼에 입력함  
        const id = req.body.id;
        const password = req.body.password;

        //쿼리문 만들기     
        //db에 쓸 쿼리를 작성할 때는 ${}보다 ?와 리스트로 작성하는 것이 바람직함 
        const qry = 
        `select * from profile where id = ?`
        const args = [id];


        //query로 위에서 만든 쿼리와 리스트 전달하고 콜백함수, err로 예외처리, data가 처리된 데이터
        connection.query(qry,args,function(err,data){
            //예외처리
            if (err) {
                throw err;
            }

            // id가 존재하지 않는경우
            //data[0]===undefined
            if (data[0]===undefined){
                console.log(`존재하지 않는 id입니다.`);
                //db 연결 종료 
                //connection.end();
                res.redirect(`/coogle`);
            }
            // id가 존재하고 비밀번호가 일치하는경우
            //data = [ RowDataPacket { id: 'd', name: 'd', password: 'd', incumbent: 0 } ]
            else if (data[0].password===password){
                //로그인 성공, 세션에 데이터 입력
                req.session.user =
                {
                    id: id,
                    pw: password,
                    authorized: true
                };
                console.log(`id : ${id}님 로그인 성공!`);
                //db 연결 종료 
                //connection.end();
                res.redirect(`/coogle`);
            }

            // id가 존재하는데, 비밀번호가 일치하지 않는경우
            else{
                console.log(`비밀번호가 일치하지 않습니다.`);
                //db 연결 종료 
                //connection.end();
                res.redirect(`/coogle`);
            }
        });
    }
)

//로그아웃
router.route(`/coogle/logout`).get(
    function(req,res){
        console.log('logout');
            //세션 데이터 삭제 
            req.session.destroy( 
                //예외처리 
                function (err) {
                    if (err) {  
                        throw(err);
                    }
                    console.log('로그아웃 성공');

                    //홈페이지로 리다이렉트 
                    res.redirect('/coogle');
                }
            );
    }
);




module.exports = router;



//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//


// // Index 
// router.get('/', function(req, res){
//   Post.find({})                  // 1
//   .sort('-createdAt')            // 1
//   .exec(function(err, posts){    // 1
//     if(err) return res.json(err);
//     res.render('posts/index', {posts:posts});
//   });
// });

// // New
// router.get('/new', function(req, res){
//   res.render('posts/new');
// });

// // create
// router.post('/', function(req, res){
//   Post.create(req.body, function(err, post){
//     if(err) return res.json(err);
//     res.redirect('/posts');
//   });
// });

// // show
// //route ':' 사용 -> 해당 위치의 값을 받아 req.params에 넣게 됨. 
// //findOne 메소드는 DB에서 해당 model의 document을 찾는 함수 (id가 매개변수와 일치하는 object 리턴)
// router.get('/:id', function(req, res){
//   Post.findOne({_id:req.params.id}, function(err, post){
//     if(err) return res.json(err);
//     res.render('posts/show', {post:post});
//   });
// });

// // edit
// router.get('/:id/edit', function(req, res){
//   Post.findOne({_id:req.params.id}, function(err, post){
//     if(err) return res.json(err);
//     res.render('posts/edit', {post:post});
//   });
// });

// // update
// router.put('/:id', function(req, res){
//   req.body.updatedAt = Date.now(); //2
//   Post.findOneAndUpdate({_id:req.params.id}, req.body, function(err, post){
//     if(err) return res.json(err);
//     res.redirect("/posts/"+req.params.id);
//   });
// });

// // destroy
// router.delete('/:id', function(req, res){
//   Post.deleteOne({_id:req.params.id}, function(err){
//     if(err) return res.json(err);
//     res.redirect('/posts');
//   });
// });

// module.exports = router;