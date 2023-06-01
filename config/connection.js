const mongoClient=require('mongodb').MongoClient
const state ={
    db:null
}
module.exports.connect=function(done){
    const url='mongodb+srv://shauns4422:vZdmM7QlSSboBbrY@cluster0.cldxdfv.mongodb.net/ecom22?retryWrites=true&w=majority'
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