var mongoose = require('mongoose');

//공모전 게시글 스키마
var competitionSchema = mongoose.Schema({ 
  title : {type:String, required:true},
  date : {type:Date, default:Date.now},
  deadLine : {type:Date},
  viewCount : {type:Number, default:0},
  image : {type:String},
  content : {type:String, required:true},
  url : {type:String},
});

// model & export
var Competition = mongoose.model('competition', competitionSchema); //스키마 객체화
module.exports = Competition; //외부에서 require로 Competition을 가져다 사용할 수 있음 