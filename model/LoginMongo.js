var mongoose = require('mongoose');

// schema
var userSchema = mongoose.Schema({
  id:{type:String, required:[true,'Username is required!'], unique:true},
  username:{type:String, required:[true,'Username is required!'], unique:true},
  password:{type:String, required:[true,'Password is required!']},
  name:{type:String, required:[true,'Name is required!']},
  email:{type:String}
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
userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

    if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', 'Current Password is required!');
    }
    else if(user.currentPassword != user.originalPassword){
      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }
});

// model & export
var Member = mongoose.model('member',userSchema);
module.exports = Member;


// schema, 이렇게 스키마를 입력하면 이대로 테이블(몽고디비에서는 컬렉션)을 만들어줌 
// 속성명이 필드의 이름이 된다 
// required:true 는 필수값 
// default는 기본값 

