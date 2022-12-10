var mongoose = require('mongoose');

//스터디룸 스키마
var studyRoomSchema = mongoose.Schema({ 
  _id : { type: String, unique:true },
  title : {type:String, required:[true,'스터디방 이름을 입력해주세요!']},
  //user와 스터디룸 연결 
  leader : {type:mongoose.Schema.Types.ObjectId, ref:'user',required:true},
  date : {type:Date, default:Date.now},
  maximum : {type:Number,required:true, default:2, min:2, max:5},
  content : {type:String, required:[true,'스터디 설명을 작성해주세요!']},
});

// model & export
var StudyRoom = mongoose.model('studyroom', studyRoomSchema); //스키마 객체화
module.exports = StudyRoom; //외부에서 require로 StudyRoom 가져다 사용할 수 있음 