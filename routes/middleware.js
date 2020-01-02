let jwt = require("jsonwebtoken");
const config = require('../config/global.js');

let verifyToken = (req, res, next) => {
    console.log("req.headers",req.headers);
    let token = req.headers['accesstoken'] || req.headers['authorization'];
    console.log("token", token);
    if(token) {
        token = token.split(' ')[1];;
    }
    if(token){
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err){
                return res.json({
                    success: false,
                    message: 'Token is invalid.'
                })
            } else{
                res.decoded = decoded;
                next();
            }
        });
    } else {
        return res.json({
            success: false,
            message : 'Token is required.'
        })
    }
};

module.exports = verifyToken