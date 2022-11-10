
// routes/posts.js

var express  = require('express');
var router = express.Router();
var Competition = require('../models/Competition');
var DateChanger = require('../public/js/getCurrentDate');


//redirect : /competitions  (서버주소 앞에 깔고시작)
//render : competitions/index (앞에 / 없이 views 아래 디렉토리부터)



// /competitions 
router.get(`/`,function(req,res){
    console.log(`공모전 리스트`);
    Competition.find({})
    .sort('-deadLine') //deadLine 역순으로 sort 
    .exec(function(err,comp){ //정렬 후 콜백함수로 처리 comp에 데이터 받아옴 
        if (err) {console.log(`예외발생`);}
        console.log('db에서 공모전 가져와서 리스트 표시할 때 형태');
        console.log(comp);
        res.render('competitions/index',{competitions:comp});
    });
});


//크롤링 함수 import
const crawl = require(`../crawling`);
//크롤링한 공모전 목록으로 이동 
router.get(`/crawling`,function(req,res){
    console.log(`크롤링한 공모전 리스트로 이동`);
    //crawl은 crawling.js의 함수를 실행하고 Promise 객체를 반환함
    //Promise 객체는 비동기 처리를 위한 객체로 객채에 then으로 받고 나서 처리를 해줘야함 
    //then(콜백함수(비동기처리완료된객체){..실행내옹}) 
    //즉 나는 비동기로 크롤링하는데 크롤링 완료된 데이터를 data 변수에 받아서 competitions라는 이름으로 crawl.ejs로 넘긴것임 
    crawl.then(function(data){
        res.render(`competitions/crawl`,{competitions:data})
    });

    //res.render(`competitions/crawl`,{competitions:crawledCompData});
});



//공모전 글 생성 버튼 눌러서 넘어온 페이지 /competitions/create
router.get('/create',function(req,res){
    console.log(`공모전 생성 입력폼`);
    res.render('competitions/create');
});


//공모전 글 생성 폼에 데이터 입력하고 나서 넘어간 페이지 /compettions/creatae/input
router.post('/create/submit',function(req,res){
    console.log(`공모전 생성 입력폼 제출`)
    console.log(`변환 전`);
    console.log(req.body);
    //req.body에 입력받은 deadLine은 deadLine : '2023-02-10' 으로 표시됨 
    req.body.deadLine = DateChanger(req.body.deadLine);
    console.log(`변환 후`);
    console.log(req.body);

    Competition.create(req.body,function(err,competition){
        if (err){
            console.log(`공모전 db 생성중 예외발생`);
            throw err;
        }
        console.log(`공모전 db 생성완`);
        res.redirect(`/competitions`);
    });
});

//공모전 글 자세히보기 
//req.params.id로 접근가능 
router.get(`/:id`,function(req,res){
    console.log(`자세히보기 접근`);
    //find로 검색해서 하나만 찾아도 [] 리스트에 담아옴 
    Competition.find({_id:req.params.id},function(err,comp){
        if (err){
            console.log(`공모전 개별 데이터 불러오는 과정에서 예외발생`);
        }
        console.log(`확인한 개별 데이터`);
        console.log(comp);
        //competiton이란 이름으로 ejs파일에 보냄 

        //공모전 자세히보기 하고 나면 조회수를 1 올려주자 
        comp[0].viewCount = comp[0].viewCount+1;

        Competition.findOneAndUpdate({_id:req.params.id},comp[0],function(err,comp){
            if (err){
                console.log(`조회수 올리다가 예외발생`);
            }
            console.log(`조회수 올리기 성공`);
        });


        res.render(`competitions/show`,{competition:comp});
    });
});


//공모전 수정하기 버튼 눌러서 공모전 수정 폼 띄우기 
router.post(`/edit/:id`,function(req,res){
    console.log(`공모전 수정 폼으로 이동`);
    //findOne으로가져옴
    Competition.findOne({_id:req.params.id},function(err,comp){
        if (err){
            console.log(`수정을 위해 findOne 호출 도중 에러`);
            throw(err);
        }
        console.log(`수정할 데이터 불러옴`);
        console.log(comp);
        //competition에 수정할 공모전 정보 담아서 edit.ejs로보냄 
        res.render(`competitions/edit`,{competition:comp});
    });
});

//공모전 수정 폼에 데이터 입력하고 제출 put요청으로 받음
router.put(`/edit/:id`,function(req,res){
    //findOneAndUpdate로 _id에 해당하는 공모전 정보 가져와서 req.body에 있는 내용 가져와서 수정함 
    Competition.findOneAndUpdate({_id:req.params.id},req.body,function(err,comp){
        if (err){
            console.log(`findOneAndUpdate 호출 예외`);
            throw err;
        }
        res.redirect(`/competitions`);
    });
});




//공모전 글 삭제 
router.delete(`/delete/:id`,function(req,res){
    console.log(`공모전 데이터 삭제하기`);
    Competition.deleteOne({_id:req.params.id},function(err){
        if (err){
            console.log(`공모전 db 삭제 예외발생`);
            throw err;
        }
        console.log(`공모전 삭제 성공`);
        res.redirect(`/competitions`);
    });

});




module.exports = router;

