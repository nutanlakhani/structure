var UserSchema = require('../../db/models/user');
var async = require('async');
let bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var users = {
    register:(req, res)=> {
        async.waterfall([
            (nextCall)=> {
                if(req.file && req.file.filename){
                    req.body.profile = req.file.filename;
                }
                nextCall(null,req.body)
            },
            (body, nextCall) =>{
                UserSchema.findOne({email:body.email}).exec((err, User)=>{
                    if(User){
                        return nextCall({message:"User already exist", status:400})
                    } else{
                        nextCall(null, body)
                    }
                })
            },
            (body, nextCall)=>{                
                const createUSerSchema = new UserSchema(body);
                console.log("in nextCall", createUSerSchema);
                createUSerSchema.save((err, user) => {
                    console.log("in inside")
                    if (err) return next(err);
                    delete user.password
                    nextCall(null, user)
                  });
               
            }
        ],(err, resArr)=> {
            if(err){
                return res.status(err.status).json(err);
            } else{
                return res.status(200).json({message:'User registered successfully', data:resArr});
            }
        })
    },

    login:(req, res) =>{
        let email = req.body.email;
        let result = {};
        UserSchema.findOne({email:email}, (err, user) => {
            if(err){
                res.json({
                    success: false,
                    message: 'User not found'
                })
            } else {
                bcrypt.compare(req.body.password, user.password).then(match => {
                    if (match) {
                      status = 200;
                      // Create a token
                      const payload = { user: user.name };
                      const options = { expiresIn: '2d' };
                      const secret = 'zxcvbnm';
                      const token = jwt.sign(payload, secret, options);
                      UserSchema.updateOne({email:user.email}, {token:token}, (err, userData)=>{
                          console.log("err", err);
                          console.log("userData", userData);
                      })
      
                      // console.log('TOKEN', token);
                      result.token = token;
                      result.status = status;
                      delete user.password;
                      result.result = user;
                    } else {
                      status = 401;
                      result.status = status;
                      result.error = `Authentication error`;
                    }
                    res.status(status).send(result);
                });
            }
        }); 
    },

    getUser:(req, res) =>{
        let result = {};
        UserSchema.findOne({email:req.body.email}).exec((err, userDetails) =>{ 
            let status = 200;
            if(err){
                result.status = 400;
                result.message = "Oops something went wrong"
            } else if(userDetails){
                delete userDetails.password
                result.status = 200;
                result.data = userDetails
            }
            res.status(status).send(result);
        })
    }
}

module.exports = users;
