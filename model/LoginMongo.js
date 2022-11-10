var mongoose = require('mongoose');

// schema, 이렇게 스키마를 입력하면 이대로 테이블(몽고디비에서는 컬렉션)을 만들어줌 
// 속성명이 필드의 이름이 된다 
// required:true 는 필수값 
// default는 기본값 
var memberSchema = mongoose.Schema({ 
  nickname : {type:String,required:true},
  id : {type:String,required:true},
  email : {type:String,required:true},
  password : {type:String,required:true},
  status : {type:String,required:true},
  roomId : {type:String},
});

// model & export
var Member = mongoose.model('member', memberSchema); //postSchema로 이름이 post인 컬렉션 
module.exports = Member; //외부에서 require로 Post를 가져다 사용할 수 있음 

