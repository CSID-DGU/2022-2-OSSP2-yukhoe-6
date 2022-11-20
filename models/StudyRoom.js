var mongoose = require('mongoose');

//스터디룸 스키마
var studyRoomSchema = mongoose.Schema({ 
  title : {type:String, required:true},
  //user와 공모전 연결 
  leader : {type:mongoose.Schema.Types.ObjectId, ref:'user',required:true},
  date : {type:Date, default:Date.now},
  capacity : {type:Number},
  NumOfPeo : {type:Number, default:1},
  content : {type:String, required:true},
});

// model & export
var StudyRoom = mongoose.model('studyroom', studyRoomSchema); //스키마 객체화
module.exports = StudyRoom; //외부에서 require로 StudyRoom 가져다 사용할 수 있음 