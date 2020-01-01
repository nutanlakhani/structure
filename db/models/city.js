var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var moment = require('moment');

const CitySchema = new Schema({
    'cityName':{
        type:String,
        default:''
    },
    'status':{
        type: Boolean,
        default: true
    },
    'createAt':{
        type:String,
        default:moment().toISOString()
    },
    'updatedAt':{
        type:String,
        default:moment().toISOString()
    }
})

CitySchema.pre('save', (next)=>{
    this.createAt = moment().toISOString();
    this.updatedAt = moment().toISOString();
    next();
})

module.exports = mongoose.model('cities', CitySchema);