const mongoClient=require('mongodb').MongoClient
const dotenv=require("dotenv")
dotenv.config();
const state ={
    db:null 
}
module.exports.connect=function(done){
    const url=process.env.MONGODB
    const dbname='ecom22'
    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
   
}
module.exports.get=function(){
    return state.db
}