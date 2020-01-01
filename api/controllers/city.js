var CitySchema = require('../../db/models/city');
var async = require('async');

var cities = {
    addCity:(req, res)=> {
        async.waterfall([
            (nextCall)=> {
                req.checkBody('cityName', 'City name is required').notEmpty();
                var error = req.validationErrors();
                if(error && error.length > 0){
                    return nextCall({message:error[0].message, status:400});
                }
                nextCall(null, req.body)
            },
            (body, nextCall) =>{
                CitySchema.findOne({cityName:body.cityName}).exec((err, city)=>{
                    if(city){
                        console.log("city")
                        return nextCall({message:"City already exist", status:400})
                    } else{
                        nextCall(null, body)
                    }
                })
            },
            (body, nextCall)=>{                
                const createCitySchema = new CitySchema(body);
                console.log("in nextCall", createCitySchema);
                createCitySchema.save((err, city) => {
                    console.log("in inside")
                    if (err) return next(err);
                    nextCall(null, city)
                  });
               
            }
        ],(err, resArr)=> {
            if(err){
                return res.status(err.status).json(err);
            } else{
                return res.status(200).json({message:'City created successfully', data:resArr});
            }
        })
    },
    getAllCity:(req, res)=>{
        let response = {
            draw : (req.body.start)? req.body.start : 0,
            data: [],          
            recordsFiltered: 0,
            recordsTotal:0
        }
        async.waterfall([
            (nextCall) =>{
                let searchQuery = {}
                if(req.body.search && req.body.search.value != ''){
                    searchQuery.cityName = {$regex: req.body.search.value, $options:'i'}
                }
                console.log("searchQuery", searchQuery);
                CitySchema.find(searchQuery).skip(req.body.start).limit(req.body.length).exec((err, cities)=>{
                    if(err){
                        return nextCall(err.message)
                    }
                    response.data = cities;
                    nextCall(null, cities)
                })
            },
            (body, nextCall)=>{
                CitySchema.count().exec((err1, recordCount)=>{
                    if(err1){
                        return nextCall(err.message)
                    }
                    response.recordsTotal = recordCount;
                    response.recordsFiltered = recordCount;
                    nextCall(null, true);
                })
            }
            
        ],(err, resArr)=>{
            if(err){
                return res.status(400).json({message:'Oops something went wrong'})
            }
            response.message = 'City List'
            return res.status(200).json(response);
        })
    },
    deleteCity:(req,res)=>{
        async.waterfall([
            (nextCall)=>{
                req.checkBody('city_id', 'City id is required').notEmpty();
                var err = req.validationErrors();
                if(err && err.length >0){
                    return nextCall(err[0].message)
                }
                nextCall(null, req.body)
            },
            (body, nextCall)=>{
                CitySchema.findOne({_id:body.city_id}).exec((err, city)=>{
                    if(city){
                        nextCall(null, body)
                    } else {
                        return nextCall('City not found');
                    }
                    
                })
            },
            (body, nextCall) =>{
                CitySchema.deleteOne({_id:body.city_id}).exec((err, city) => {
                    console.log("err",err);
                    console.log("city", city);
                    if(err){
                        return nextCall({message:'City not deleted'})
                    }
                    nextCall(null, {})
                })
            }

        ], (err, resArr)=>{
            if(err){
                return res.status(400).json({message:err})
            }
            return res.status(200).json({message: 'City deleted success fully', data:{}})
        })
    }
}

module.exports = cities;
