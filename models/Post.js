var mongoose = require('mongoose');
var Counter = require('./Counter');

// schema
var postSchema = mongoose.Schema({
  //required:[true,커스텀 에러메세지]
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  //relationship 형성 : user.id와 post.author를 연결 
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  views:{type:Number, default:0},
  numId:{type:Number},
  attachment:{type:mongoose.Schema.Types.ObjectId, ref:'file'},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

postSchema.pre('save', async function (next){
  var post = this;
  if(post.isNew){
    counter = await Counter.findOne({name:'posts'}).exec();
    if(!counter) counter = await Counter.create({name:'posts'});
    counter.count++;
    counter.save();
    post.numId = counter.count;
  }
  return next();
});

// model & export
var Post = mongoose.model('post', postSchema);
module.exports = Post;
