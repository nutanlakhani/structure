const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var moment = require('moment');

//Define a schema
const Schema = mongoose.Schema;
const UserSchema = new Schema({
 fistName: {
  type: String,
  trim: true,  
  required: true,
 },
 lastName: {
    type: String,
    trim: true,  
    required: true,
 },
 email: {
  type: String,
  trim: true,
  required: true
 },
 password: {
  type: String,
  trim: true,
  required: true
 },
 token:{
    type:String,
    default:''
 },
 hobbies:{
    type:[String],
    default:[]
 },
 profile:{
    type:String,
    default:''
 },
 gender:{
    type:String,
    enum:['male','female'],
    default:'male'
 },
 cityId:{
    type:Schema.Types.ObjectId,
    ref:"cities"
 },
 status:{
    type:Boolean,
    default:true
 },
 createdAt:{
     type:Date,
     default:moment().toISOString()
 },
 updatedAt:{
   type:Date,
   default:moment().toISOString()
 }
});
// hash user password before saving into database
UserSchema.pre('save', function(next){
this.password = bcrypt.hashSync(this.password, saltRounds);
next();
});
module.exports = mongoose.model('Users', UserSchema);