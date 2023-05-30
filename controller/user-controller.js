var db = require('../config/connection')
var session = require('express-session')
var adminHelpers = require('../helpers/admin-helpers');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const async = require('hbs/lib/async');
const collections = require('../config/collections');
const Razorpay=require('razorpay')
function createTransporter(userEmail, userPassword) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: userEmail,
      pass: userPassword
    }
  });
}
require('dotenv').config()
module.exports = {
  getSignUp: (req, res) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    res.render('user/signup')
  },
  postSignUp: (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
      // console.log(response);
      res.redirect('/login')
    })

  },
  getLogin: (req, res) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    if (req.session.loggedIn) {
      res.redirect("/")
    }
    else {
      res.render("user/login", { "loginErr": req.session.loginErr })
      req.session.loginErr = false
    }
  },
  postLogin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user

        res.redirect('/')
      }
      else if (response.blocked) {
        let userBlockErr = true;
        res.render('user/login', { userBlockErr });
      }
      else {
        req.session.loginErr = true
        res.redirect('/login')
      }
    })
  },
  getHome: async (req, res) => {

   
      let wishlistCount= await userHelpers.getWishListCount(req.session._id);
    
    
    let user = req.session.user
    let banner = await userHelpers.getBanner()
    let cartCount = await userHelpers.getCartCount(req.session._id)
    productHelpers.getAllProducts({ isActive: true }).then((products) => {
      // console.log(products);
      res.render('user/home', { products, user, banner, cartCount,wishlistCount })
    })
  },
  getShop: async (req, res) => {
    let search = '';
    let page = 1;
    let limit = 2;
    if (req.query.search) {
      search = req.query.search;
    }

    if (req.query.page) {
       page = parseInt(req.query.page);
      
    }
    
    const count = await productHelpers.getProductsPageCount(search,page,limit);
    let categories = await adminHelpers.getAllCategories({ isBLocked: false })
    
     const  wishlistCount= await userHelpers.getWishListCount(req.session.user._id);
    const totalPages = Math.ceil(count / limit);
    let cartCount = await userHelpers.getCartCount(req.session.user._id)

    let product = await productHelpers.getAllProducts1({ isActive: true }, search,page,limit)
   
    // console.log("shopPage Serin",totalPages,page);
    res.render('user/shop', {
      product, categories, user: req.session.user,wishlistCount, cartCount,search,totalPages,page
    })
  },
  getsingleproduct: async (req, res) => {
    let user = req.session.user
    
    wishlistCount=await userHelpers.getWishListCount(req.session.user._id)
    // console.log("1111111111111111111111111111111111111");
    let product = await productHelpers.getProductDetails(req.params.id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    // console.log(cartCount, "ddddddddddddd");
    res.render('user/product-view', { product, user, cartCount,wishlistCount });
  },
  getCategoryWise: async (req, res) => {
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    wishlistCount=await userHelpers.getWishListCount(req.session.user._id)


    let user = req.session.user;
    // console.log(req.params.id,"vaaaaaaaaaaaaaaaa");


    let categories = await userHelpers.getAllcategories()
    await productHelpers.getCategoryWiseProducts(req.params.id).then((products) => {
      // console.log(products, "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
      res.render('user/product-categoryView', { user, products, cartCount, wishlistCount, categories })
    })

  },

  getLogout: (req, res) => {
    req.session.user = null;
    req.session.loggedIn = false;
    res.redirect("/")
  },

  getProductDetails: async (req, res) => {
    let user = req.session.user
    let categories = await adminHelpers.getAllCategories()
    let product = await productHelpers.getProductDetails(req.query.id)
    let cartCount = await userHelpers.getCartCount(req.session._id)
   
    wishlistCount=await userHelpers.getWishListCount(req.session.user._id)
    res.render('user/product-view', { categories, product, user, cartCount,wishlistCount });
  },
  postProductDetails: (req, res) => {
    res.redirect('/product-view', { products, user })
  },
  getOtpPage: (req, res) => {
    res.render('user/userOtp', { layout: null });
  },
  let: signupData = 0,

  postOtpPage: (req, res) => {
    userHelpers.doOTP(req.body).then((response) => {
      if (response.status) {
        signupData = response.user;
        // console.log(signupData, "ttttttttt")

        res.redirect('/confirmOtp')

      }
      else {
        res.redirect('/userOtp')
      }
    })

  },
  getConfirmOtp: (req, res) => {
    res.render('user/confirmOtp', { layout: null, })
  },
  postConfirmOtp: (req, res) => {
    // console.log(req.body, "4444444444444444444444444")
    // console.log(signupData, "12222222222222222222222");
    userHelpers.doOTPConfirm(req.body, signupData).then((response) => {

      if (response.status) {
        // console.log(response.status, "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");

        req.session.loggedIn = true;
        req.session.user = signupData;
        // console.log(signupData, "zzzzzzzzzzzzzzzzzzzzzzz");

        res.redirect('/')
      } else {
        res.redirect('/confirmOtp')
      }
    })
  },
  // getforgotOtp: (req, res) => {
  //   res.render('user/forgot', { layout: null });
  // },
  // let: signupData = 0,

  // postforgotOtp: (req, res) => {
  //   userHelpers.doOTP(req.body).then((response) => {
  //     if (response.status) {
  //       signupData = response.user;
  //       console.log(signupData, "ttttttttt")

  //       res.redirect('/confirm')

  //     }
  //     else {
  //       res.redirect('/userOtp')
  //     }
  //   })

  // },
  // getConfirm: (req, res) => {
  //   res.render('user/confirm', { layout: null, })
  // },
  // postConfirm: (req, res) => {
  //   console.log(req.body, "4444444444444444444444444")
  //   console.log(signupData, "12222222222222222222222");
  //   userHelpers.doOTPConfirm(req.body, signupData).then((response) => {

  //     if (response.status) {
  //       console.log(response.status, "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");

  //       req.session.loggedIn = true;
  //       req.session.user = signupData;
      

  //       res.render('/newPasword')
  //     } else {
  //       res.redirect('/confirm')
  //     }
  //   })
  // },
  getcartDetails: async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id)
   
    let  wishlistCount=await userHelpers.getWishListCount(req.session.user._id)
    let totalValue = 0
    let isCartEmpty = true;
    if (products.length > 0) {
      totalValue = await userHelpers.getTotalAmount(req.session.user._id)
      isCartEmpty = false;
    }

    let cartCount = null

    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)

    }

    res.render('user/cart', { products, user: req.session.user, cartCount, totalValue, isCartEmpty,wishlistCount })

  },
  getAddToCart: (req, res) => {
    const productId = req.params.id;
    const userId = req.session.user._id;
    userHelpers.addToCart(productId, userId)
      .then(() => {
        res.json({ status: true });
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
        res.json({ status: false, message: 'Failed to add item to cart' });
      });
  },
  postChangeProductQuantity: (req, res, next) => {
    userHelpers.changeProductQuantity(req.body)
      .then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user)

        res.json(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  postRemoveCartProduct: (req, res, next) => {
    userHelpers.removeCartProduct(req.body)
      .then((response) => {
        res.json(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  // getProfile:async(req,res)=>{

  //   let total=await userHelpers.getTotalAmount(req.session.user._id);
  //   let orders=await userHelpers.getUserOrders(req.session.user._id);
  //   let cartCount=null
  //   if(req.session.user){
  //     cartCount=await userHelpers.getCartCount(req.session.user._id)

  //   }
  //   userHelpers.getAllAddresses(req.session.user._id)
  //   .then((addresses)=>{ 
  //     res.render('user/profile',{total,user:req.session.user,cartCount,addresses,orders})

  //   })
  //   .catch(error => {
  //     console.error(`The operation failed with error: ${error.message}`);
  //   });
  // },getProfile: async (req, res) => {
  getProfile: async (req, res) => {
    try {
      const total = await userHelpers.getTotalAmount(req.session.user._id);
      const orders = await userHelpers.getUserOrders(req.session.user._id);
      const cartCount = await userHelpers.getCartCount(req.session.user._id);
      const addresses = await userHelpers.getAllAddresses(req.session.user._id);
      let balance=await userHelpers.getWalletBalance(req.session.user._id);
      res.render('user/profile', {
        total,
        user: req.session.user,
        cartCount,
        addresses,
        orders,
        balance
      });
    } catch (error) {
      console.error(`The operation failed with error: ${error.message}`);
      // Handle the error appropriately, such as redirecting to an error page
    }
  }

  , postAddress: (req, res) => {

    userHelpers.addAddress(req.body)
      .then((data) => {


        res.redirect('/profile');
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },

  getDeleteAddress: (req, res) => {
    let addressId = req.params.id;
    userHelpers.deleteAddress(addressId)
      .then((response) => {
        res.redirect('/profile')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },


  getEditAddress: async (req, res) => {

    user = req.session.user;
    let address = await userHelpers.getAddressDetails(req.params.id);
    let orders = await userHelpers.getUserOrders(req.session.user._id);

    res.render('user/editAddress', { address, user, orders });

  },
  postEditAddress: (req, res) => {
    let id = req.params.id
    // console.log(req.body, "111111111111111111111111111111111111111111111");
    userHelpers.updateAddress(id, req.body)
      .then(() => {
        res.redirect("/profile");

      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  getPlaceOrder: async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    let total = 0;
    if (products.length > 0) {
      total = await userHelpers.getTotalAmount(req.session.user._id);
    }
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)

    }
    userHelpers.getAllAddresses(req.session.user._id)
      .then((addresses) => {
        res.render('user/place-order', { products, total, user: req.session.user, cartCount, addresses })

      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  postPlaceOrder: async (req, res) => {
    // console.log(req.body.address,"orders");
    console.log(" POST PLACE ORDER FUNCTION POINT");

    let address =await userHelpers.getAddressDetails(req.body.address)
    let products = await userHelpers.getCartProductList(req.body.userId);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    let verifyCoupon = await userHelpers.couponVerify(req.body.userId);
    // let newAddressId = await userHelpers.addAddress(req.body)
    if (verifyCoupon.name == req.body.coupon) {
      // console.log(address,"oiipo")
      let percentage = verifyCoupon.couponPercentage;

      let discountAmount = (totalPrice * parseInt(verifyCoupon.couponPercentage)) / 100;

      let amount = totalPrice - discountAmount;

      amount = parseInt(amount)


      await userHelpers.placeOrder(req.body, products, amount,address)
        .then((orderId, amount) => {
          if (req.body['payment-method'] === 'COD') {
            res.json({ codSuccess: true })
          }
           else if (req.body['payment-method'] === 'WALLET') {
          let userId = req.session.user._id;
          let orderId = req.params.id;
          console.log(orderId,"OrderId----");

          userHelpers.changePaymentStatus(orderId)
          userHelpers.removeCartItems(userId)
          userHelpers.updateWallet(amount, userId)
          .then((response) => {
            console.log("222222222222",response,"222222222222");
              res.json(response)
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });

        }
          else {
            userHelpers.generateRazorpay(orderId, amount)
              .then((response) => {
                // console.log(response)
                res.json(response)
              })
              .catch(error => {
                console.error(`The operation failed with error: ${error.message}`);
              });
          }


        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
      // console.log(req.body)

    }
    else {
      // console.log(address,"oiipo")

      await userHelpers.placeOrder(req.body, products, totalPrice,address)
        .then((orderId) => {
          console.log(orderId,"OrderId----");
          if (req.body['payment-method'] === 'COD') {
            
            res.json({ codSuccess: true })
          }else if (req.body['payment-method'] === 'WALLET') {
            let userId = req.session.user._id;
            // let orderId = req.params.id;
            console.log(orderId,"OrderId----");
  
            userHelpers.changePaymentStatus(orderId)
            userHelpers.removeCartItems(userId)
            userHelpers.updateWallet(totalPrice, userId)
            .then((response) => {
              console.log("222222222222",response,"222222222222");
                res.json(response)
              })
              .catch(error => {
                console.error(`The operation failed with error: ${error.message}`);
              });
  
          }
          else {
            userHelpers.generateRazorpay(orderId, totalPrice)
              .then((response) => {
                // console.log(response)
                res.json(response)
              })
              .catch(error => {
                console.error(`The operation failed with error: ${error.message}`);
              });
          }


        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
      // console.log(req.body)
    }
  },
  addAdress_checkout:async(req,res)=>{
    console.log(req.body,"eeeeeeeeee");
    userHelpers.addAddress(req.body)
      .then((data) => {
        console.log(data,"eeeeeeeeee");

        res.redirect('/place-order');
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  getOrderSuccess: async (req, res) => {
    res.render('user/order-success', { user: req.session.user })
  },
  getOrders: async (req, res) => {


    let orders = await userHelpers.getUserOrders(req.session.user._id);

    res.render('user/orders', { user: req.session.user, orders })
    // console.log("1111111111", orders, "1111111111");
  },
  getOrderDetails: async (req, res) => {

    let order = await userHelpers.getOrderDetails(req.params.id)
    let products = await userHelpers.getOrderProducts(req.params.id)
    let address = await userHelpers.getShipAddress(req.params.id)

    res.render('user/orderDetails', { user: req.session.user, order, products, address })
  },
  getOrderCancel: async (req, res) => {
    let orderId = req.params.id;
    let order =await userHelpers.getOrderDetails(req.params.id);
    let refund=order.totalAmount
    let userId=req.session.user._id
    // console.log(orderId);
    userHelpers.addToWallet(userId,refund)
    userHelpers.cancelOrder(orderId)
      .then((response) => {
        res.redirect('/orders')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });

  }, postVerifyPayment: (req, res) => {
    console.log("VERIFY PAYMENT WINDOW");
    // console.log(req.body);
    userHelpers.verifyPayment(req.body).then(() => {
      userHelpers.changePaymentStatus(req.body['order[receipt]'])
        .then(() => {
          console.log("Payment Successful");
          res.json({ status: true })
        })
    }).catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: '' })
    })
  },
  getOrderReturn:async (req, res) => {
    let orderId = req.params.id;
    let order =await userHelpers.getOrderDetails(req.params.id);
    let refund=order.totalAmount
    let userId=req.session.user._id
    // console.log(orderId);
    userHelpers.addToWallet(userId,refund)
    // console.log(orderId);
    userHelpers.returnOrder(orderId)
      .then((response) => {
        res.redirect('/orders')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });

  },
  //   postCouponApply:async(req,res)=>{
  //     let user=req.session.user._id;
  //     const date=new Date();
  //     let totalAmount= await userHelpers.getTotalAmount(user)
  //     let Total=totalAmount;

  //     if(req.body.coupon == ''){
  //         res.json({noCoupon:true,Total})
  //     }
  //     else
  //     { 
  //         let couponres=await userHelpers.applyCoupon(req.body,user,date,totalAmount)
  //         if (couponres.verify) {

  //         let discountAmount=(totalAmount * parseInt(couponres.couponData.couponPercentage))/100;
  //         let amount = totalAmount - discountAmount
  //         couponres.discountAmount = Math.round(discountAmount)
  //         couponres.amount = Math.round(amount);
  //         res.json(couponres)

  //     }else{

  //         couponres.Total=totalAmount;
  //         res.json(couponres)

  //     }

  //     }


  //  },
  postCouponApply: async (req, res) => {
    let user = req.session.user._id;
    const date = new Date();
    let totalAmount = await userHelpers.getTotalAmount(user)
    let Total = totalAmount;


    if (req.body.coupon == '') {
      res.json({ noCoupon: true, Total })
      return
    }
    else {
      let couponres = await userHelpers.applyCoupon(req.body, user, date, totalAmount)
      if (couponres.verify) {

        let discountAmount = (totalAmount * parseInt(couponres.couponData.couponPercentage)) / 100;
        let amount = totalAmount - discountAmount
        couponres.discountAmount = Math.round(discountAmount)
        couponres.amount = Math.round(amount);
        couponres.percentage = Math.round(couponres.couponData.couponPercentage);
        console.log(couponres, "HIMONUTTA");

        res.json(couponres)
        // console.log(Total, "Chukam");
      } else {

        couponres.Total = totalAmount;
        // console.log(Total, "Chukammmmmmmmm");
        res.json(couponres)

      }

    }


  },
  // // postCouponApply: async (req, res) => {
  //   let user = req.session.user._id;
  //   const date = new Date();
  //   let totalAmount = await userHelpers.getTotalAmount(user);
  //   let Total = totalAmount;

  //   if (!req.body.coupon) {
  //     res.json({ noCoupon: true, Total });
  //   } else {
  //     let couponres = await userHelpers.applyCoupon(req.body, user, date, totalAmount);
  //     if (couponres.verify) {
  //       let discountAmount = (totalAmount * parseInt(couponres.couponData.couponPercentage)) / 100;
  //       let amount = totalAmount - discountAmount;
  //       couponres.discountAmount = Math.round(discountAmount);
  //       couponres.amount = Math.round(amount);
  //       couponres.percentage = Math.round(couponres.couponData.couponPercentage);
  //       console.log(couponres, "HIMONUTTA");
  //       res.json(couponres);
  //       console.log(Total, "Chukam");
  //     } else {
  //       couponres.Total = totalAmount;
  //       console.log(Total, "Chukammmmmmmmm");
  //       res.json(couponres);
  //     }
  //   }
  // },


  postCouponRemove: async (req, res) => {

    let user = req.session.user._id;
    await userHelpers.removeCoupon(user).then(async (response) => {
      response.totalAmount = await userHelpers.getTotalAmount(user);
      res.json(response)
    })
  },
  getWishList: async (req, res) => {
    const productId=req.params.id;
    let products = await userHelpers.getWishListProducts(req.session.user._id);
    let quantity = await productHelpers.getInventory(productId);
    let stock=true;
    let isWishListEmpty=true;

    if(quantity===0)
    {
      stock=false;
    }
    if (products.length > 0) {
      isWishListEmpty=false;
    }

    let cartCount=null
    let wishListCount = null

    if (req.session.user) {
      cartCount=await userHelpers.getCartCount(req.session.user._id);
      wishListCount = await userHelpers.getWishListCount(req.session.user._id);

    }

    res.render('user/wishlist', { products, user: req.session.user,cartCount, wishListCount,isWishListEmpty,stock})
  },
  getAddToWishList:(req, res) => {
    const productId = req.params.id;


    const userId = req.session.user._id;
    userHelpers.addToWishList(productId, userId)
      .then((response) => {
        res.json( response );
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
        res.json({ status: false, message: 'Failed to add item to wishlist' });
      });


  },
  postRemoveWishListProduct: (req, res, next) => {
    userHelpers.removeWishListProduct(req.body)
      .then((response) => {
        res.json(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  getForgotPassword: (req, res) => {
    res.render('user/forgotPassword');
  },
  postForgotPassword: (req, res) => {
    userHelpers.checkUserExists(req.body).then((response) => {
      console.log(response,"foregt");
      if (response.userExists) {
        userHelpers.sendForgotPasswordOTP(response.user).then(() => {
          signupData = response.user;
          res.redirect('/confirmForgotPasswordOtp');
        });
      } else {
        res.redirect('/forgotPassword');
      }
    });
  },
  
  getConfirmForgotPasswordOtp: (req, res) => {
    res.render('user/confirmForgotPasswordOtp', { layout: null });
  },
  postConfirmForgotPasswordOtp: (req, res) => {
    userHelpers.verifyForgotPasswordOTP(req.body, signupData).then((response) => {
      if (response.status) {
        res.redirect('/resetPassword');
      } else {
        res.redirect('/confirmForgotPasswordOtp');
      }
    });
  },
  getResetPassword: async (req, res) => {
    res.render('user/resetPassword', { layout: null });
  },

  postResetPassword: (req, res) => {
    userHelpers.updatePassword(req.body, signupData).then(() => {
      res.redirect('/login');
    });
  },







}