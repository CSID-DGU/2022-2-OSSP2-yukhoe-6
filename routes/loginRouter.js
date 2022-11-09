// routes/posts.js
var alert = require('alert');
var express  = require('express');
var router = express.Router();

//session
var expressSession = require('express-session');

//스키마 객체 가져옴 
var Member = require('../model/LoginMongo');
//var connection = require('../model/Login');
//connection.connect();

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
        

        //폼 데이터로 몽고DB에 create 
        Member.create(req.body,function(err,member){
            if (err) {
                console.log(`Member DB 생성 중 예외발생`);
            }
        });

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
        const inputId = req.body.id;
        const inputPassword = req.body.password;


        //입력받은 id값을 이용해 db에서 데이터를 찾음 
        Member.findOne({id:inputId},function(err,member){
            if (err){
                
                console.log(`로그인 도중 예외발생`);
                throw err;
            }
            
            //테이블에 존재하지 않는 id 입력시 null 반환 
            if (member===null){
                alert(`존재하지 않는 id`);
                console.log(`존재하지 않는 id 입력`);
                

            }
            //id는 맞게 입력했는데 pw가 틀릴 경우
            else if (member.password!=inputPassword){
                console.log(`pw가 일치하지 않습니다`);
            }
            else {
                console.log(`로그인에 성공하여 세션에 데이터 저장`);
                //로그인 성공, 세션에 데이터 입력
                req.session.user =
                {
                    id: inputId,
                    pw: inputPassword,
                    authorized: true
                };
                console.log(req.session.user);
            }

        
            res.redirect(`/coogle`);
            
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

//마이페이지를 눌렀을 때 
router.route(`/coogle/mypage`).get(
    function(req,res){
        console.log(`마이페이지`);
        //로그인 했을 경우 
        if (req.session.user){
            const id = req.session.user.id;
            res.redirect(`/coogle/mypage/${id}`);

        }
        else {
            //로그인하지 않았는데 주소창에 쳐서 마이페이지에 접근하려고 하면 홈페이지로 리다이렉트 
            res.redirect(`/coogle`);
        }
    }
)

//마이페이지를 누르고 나서 로그인 한 상태면 여기로 리다이렉트 
// :id는 url의 해당 위치 값을 req.params에 id로 저장한다 
router.route('/coogle/mypage/:id').get(function(req,res){
    Member.findOne({id:req.params.id},function(err,member){
        if (err) throw err; //예외처리 

        console.log(member);

        //받아온 데이터를 logins/mypage에서 mypage라는 변수명으로 사용할 수 있다. 
        res.render(`logins/mypage`,{mypage:member});
    });
});


//라우터 외부 파일에서 사용할 수 있게 해줌 
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