var express = require('express');
const { response } = require('../app');
const userController = require('../controller/user-controller');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const middleware=require('../middleware/middleware');

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   let user=req.session.user
//   productHelpers.getAllProducts().then((products)=>{
//   console.log(products);
//   res.render('user/home',{products,user})
// })
// });
router.get("/",userController.getHome)
router.get("/shop",middleware.verifyLogin,userController.getShop)
router.get('/viewCategoryWise/:id',middleware.verifyLogin,userController.getCategoryWise)
// router.get("/login", function (req, res, next) {
//   res.render("user/login")
// });
// router.post('/login',(req,res)=>{
//   userHelpers.doLogin(req.body).then((response)=>{
//     if(response.status){
//       req.session.loggedIn=true
//       req.session.user=response.user
//       res.redirect('/')
//     }
//     else{
//       res.redirect('/login')
//     }
//   })
// })
router.get("/login",userController.getLogin)
router.post("/login",userController.postLogin)
// router.get("/signup", function (req, res, next) {
//   res.render("user/signup");
// });
router.get("/signup",userController.getSignUp)
// router.post('/signup',(req,res)=>{
//   userHelpers.doSignup(req.body).then((response)=>{
//     console.log(response);
//     res.redirect('/login')
//   })
  
// })
router.post("/signup",userController.postSignUp)
//
router.get("/OtpPage",userController.getOtpPage)
router.post("/Otp",userController.postOtpPage)
router.get('/confirmOtp',userController.getConfirmOtp)
router.post('/confirmOtp',userController.postConfirmOtp)
//
router.get('/forgotPassword', userController.getForgotPassword);
router.post('/forgotPassword', userController.postForgotPassword);
router.get('/confirmForgotPasswordOtp', userController.getConfirmForgotPasswordOtp);
router.post('/confirmForgotPasswordOtp', userController.postConfirmForgotPasswordOtp);
router.get('/resetPassword', userController.getResetPassword);
router.post('/resetPassword', userController.postResetPassword);
// router.get("/forgotOtp",userController.getforgotOtp)
// router.post("/Otp",userController.postforgotOtp)
// router.get('/confirm',userController.getConfirm)
// router.post('/confirm',userController.postConfirm)
//


router.get('/profile',middleware.verifyLogin,middleware.isActive,userController.getProfile);
router.post('/profile',userController.postAddress);
router.get('/deleteAddress/:id',middleware.isActive,userController.getDeleteAddress);
router.get('/editAddress/:id',middleware.isActive,userController.getEditAddress);
router.post('/editAddress/:id',userController.postEditAddress);
router.get('/product-details/:id',middleware.verifyLogin, middleware.isActive,userController.getsingleproduct);
router.get("/logout",userController.getLogout)

router.get("/cart",middleware.verifyLogin,userController.getcartDetails)
router.get('/addToCart/:id', userController.getAddToCart);
router.post('/change-product-quantity',userController.postChangeProductQuantity);
router.post('/remove-cart-product',userController.postRemoveCartProduct);
//
router.get('/wishList',middleware.verifyLogin,userController.getWishList);
router.get('/addToWishList/:id',userController.getAddToWishList);
router.post('/remove-wishlist-product',userController.postRemoveWishListProduct); 
//
router.get('/place-order',middleware.verifyLogin,userController.getPlaceOrder);
router.post('/place-order',userController.postPlaceOrder);
router.post('/applyCoupon',userController.postCouponApply)
router.post('/removeCoupon',userController.postCouponRemove)
router.post('/add-address-checkout',userController.addAdress_checkout)

router.get('/order-success',middleware.isActive,userController.getOrderSuccess);
router.get('/orders',middleware.isActive,userController.getOrders);
router.get('/view-order-products/:id',userController.getOrderDetails);
router.get('/order-cancel/:id',middleware.isActive,userController.getOrderCancel);
router.post('/verify-payment',middleware.isActive,userController.postVerifyPayment);
router.get('/order-return/:id',middleware.isActive,userController.getOrderReturn);


module.exports = router;
