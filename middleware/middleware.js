
const { validationResult } = require('express-validator');
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
  // },
  // isActive : () => {
  //   return async (req, res, next) => {
  //     console.log("middleawerw");
  //     try {
  //       const userId = req.session.user._id
  //       // const user = await adminHelpers.getAllUsers(userId)
  //       const user= await adminHelpers.updateUserStatus(userId);
  //       console.log(user);
  //       if (!user.isblocked) {
          
  //         next()
  //       } else {
  //         req.session.user = null
  //         res.redirect('/login')
  //       }
  //     } catch (error) {
  //       console.error(error)
  //       res.redirect('/error')
  //     }
  //   }
  //  },
  //  checkUser:()=> {
  //     return async (req, res, next) => {
  //       try {
  //     const userId = req.session.userId;
  //     // const Active = await adminHelpers.checkUserStatus(userId);
  //     const user = await adminHelpers.getAllUsers(userId)
  
  //     if (!Active) {
  //       await adminHelpers.updateUserStatus(userId, false);
  //       req.session = null
  //       res.redirect('/login');
  //     } else {
  //       next();
  //     }
  //   }
  //   catch (error) {
  //     console.error(error)
  //     res.redirect('/error')
  //   }
  //   }
  // },
  validateForgotPassword: [
    // Middleware to validate the input fields in the forgot password form
    userHelpers.validateForgotPassword,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('user/forgotPassword', { errors: errors.array() });
      }
      next();
    }
  ],
  
  
    
  }