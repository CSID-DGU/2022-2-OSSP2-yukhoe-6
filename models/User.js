var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// schema
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'username을 입력해주세요!'],
    match:[/^.{4,12}$/,'4-12 글자로 입력해주세요!'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'Password를 입력해주세요!'],
    select:false
  },
  name:{
    type:String,
    required:[true,'Name을 입력해주세요!'],
    match:[/^.{4,12}$/,'4-12 글자로 입력해주세요!'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'올바른 email 형식이 아닙니다!'],
    trim:true
  },
  //공부한 시간 저장
  time:{
    type:Number,
    default:0,
    //매 30일마다 초기화
    expires:2592000

 },
  studyrooms : {type : [mongoose.Types.ObjectId]},
  posts : {type: [mongoose.Types.ObjectId]}


},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = '영문과 숫자 조합으로 8글자 이상 작성해주세요!';
userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password 확인이 필요합니다.');
    }

    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다!');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', '현재 비밀번호를 입력해주세요!');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('currentPassword', '비밀번호가 일치하지 않습니다!');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다!');
    }
  }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
