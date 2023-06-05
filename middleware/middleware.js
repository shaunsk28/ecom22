

const userHelpers = require('../helpers/user-helpers');
const async = require('hbs/lib/async');
const adminController = require('../controller/admin-controller');
const adminHelpers = require('../helpers/admin-helpers');

module.exports={
    verifyLogin:(req,res,next)=>{
      if(req.session.user){
        next()
      }
      else{
        res.redirect('/login')
      }
         
    },


    isActive:async(req, res, next) => {
      const userId = req.session.user._id
        const user= await adminHelpers.getAllUsers(userId);
        console.log(user);
        console.log(user,"dshasdbhb")
      if(!user[0].isblocked){
        next();
      } else {
        req.session.loggedIn=false
        res.redirect('/login')
         
      }
          
    },
    isAdmin:(req,res,next)=>{
      if(req.session.adminLogin){
        next()
      }
      else{
        res.redirect('/admin')
      }
         
    },      
  
  
  
  
    
  }