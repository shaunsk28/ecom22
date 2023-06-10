var db = require('../config/connection')
var collection=require('../config/collections');
const async = require('hbs/lib/async');
const bcrypt=require('bcrypt');
const Razorpay = require('razorpay')
const instance = new Razorpay({
  key_id: 'rzp_test_srWwsiEgeprBon',
  key_secret: 'ovkARhoaZOQ7sAlo7AGQaFE0',
});
const Swal = require('sweetalert');
require('dotenv').config()
const ACCOUNT_SID =process.env.ACCOUNT_SID
const AUTH_TOKEN =process.env.AUTH_TOKEN
const SERVICE_ID = process.env.SERVICE_ID
const Client=require("twilio")(ACCOUNT_SID,AUTH_TOKEN)

const ObjectId=require('mongodb').ObjectId
module.exports={
    doSignup:(userData)=>{
        
        return new Promise(async (resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
              
               resolve({status:false})
           }
           else{

            userData.password=await  bcrypt.hash(userData.password,10)
            console.log(userData.password,"hello")
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                console.log(data,"signed in");
                resolve(data.insertedId)
                resolve({status:true})
            })
            console.log();
        }
        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
           let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){

                 if(user.isblocked){
                    resolve({error:"user is blocked"})
                 }else{
                bcrypt.compare(userData.password, user.password).then((status)=>{
                    if(status){
                        response.user=user
                        response.status=true
                        resolve(response)
                        
                    }
                    else{
                        resolve({status:false})
                    }
                })
            }
            }else{
                resolve({status:false})
            }            
        })

    },
    getAllcategories:()=>{
      return new Promise(async(resolve,reject)=>{
       let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
       resolve(categories)
      })
    }, 
    doOTP:(userData)=>{
        let response={}
         return new Promise(async(resolve,reject)=>{
          let user=await db.get().collection(collection.USER_COLLECTION).findOne({phone:userData.pnumber})
          if(user){
             
            response.status=true
            response.user=user
            
            Client.verify.v2.services(SERVICE_ID)
            .verifications
            .create({ to: `+91${userData.phone}`, channel: 'sms' })
            .then((data)=>{
              
             
            });console.log(userData.phone,"123456789");
            resolve(response)
          }
          else{
            response.status=false;
            resolve(response)
          }
         })
  
      },
  
      doOTPConfirm:(confirmotp,userData)=>{
         return new Promise((resolve,reject)=>{
          
          Client.verify.v2.services(SERVICE_ID)
          .verificationChecks.create({
            to:`+91${userData.number}`,
            code:confirmotp.phone
          })
          .then(async(data)=>{
           console.log(data,"1234567890-");
            if(data.status==='approved'){
             
              resolve({status:true})
            }else{
              resolve({status:false})
            }
          })
         })
      },
      getWalletBalance: (userId) => {
        return new Promise(async (resolve, reject) => {
          let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: ObjectId(userId) })
          let balance=0;
          console.log(wallet);
          if(wallet)
          {
           balance = Math.abs(wallet.balance);
        
          }
          resolve(balance);
        
        })
      },
      addToCart: (proId, userId) => {
        let  proObj={
        item:ObjectId(proId),
        quantity:1
      }
      return new Promise(async(resolve,reject)=>{
        let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(userCart)
        {
          let proExist=userCart.products.findIndex(product=>product.item==proId)
          if(proExist!=-1)
          {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({user:ObjectId(userId),'products.item':ObjectId(proId) },
            {
              $inc:{'products.$.quantity':1}
            }
            ).then(()=>{
              resolve()
            })
          } 
          else 
          {
          db.get().collection(collection.CART_COLLECTION)
          .updateOne({user:ObjectId(userId)},
            {
              
                $push:{products:proObj}
              
            }
          ).then((response)=>{
              resolve()
          })
          }
        }else 
        {
            let cartObj={
              user:ObjectId(userId),
              products:[proObj]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
              console.log(response);
              resolve()
            })
        }
      
        })
      },
      getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
    
          let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
              $match: { user: ObjectId(userId) }
            },
            {
              $unwind: '$products'
            },
            {
              $project: {
                item: '$products.item',
                quantity: '$products.quantity'
              }
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
    
              }
            }
          ]).toArray()
          resolve(cartItems)
          console.log("cartItems",cartItems);
        })
      },
      getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count= 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(cart){
                count = cart.products.length;
                console.log(count,"dsdssdsdd");
            }
                resolve(count)
        })
     },
      changeProductQuantity:(details)=>{
        details.count=parseInt(details.count);
        details.quantity=parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
          if(details.count==-1 && details.quantity==1)
          {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:ObjectId(details.cart)},
            {
              $pull:{products:{item:ObjectId(details.product)}}
            }
            ).then((response)=>{
              resolve({removeProduct:true})
            })
          }else
          {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product) },
            {
              $inc:{'products.$.quantity':details.count}
            }
            ).then((response)=>{
              resolve({status:true})
            })
          }
        })
      },
      removeCartProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:ObjectId(details.cart)},
            {
              $pull:{products:{item:ObjectId(details.product)}}
            }
            ).then((response)=>{
              resolve({removeProduct:true})
            })  
        })
      },
      getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
    
          let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
              $match: { user: ObjectId(userId) }
            },
            {
              $unwind: '$products'
            },
            {
              $project: {
                item: '$products.item',
                quantity: '$products.quantity'
              }
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
    
              }
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      { $toDouble: "$quantity" },
                      { $toDouble: "$product.Price" }
                    ]
                  }
                }
    
              }
            }
    
          ]).toArray()
          if (total[0]) {
            resolve(total[0].total);
          }
          else {
            resolve(0)
          }
    
        })
    
      },
       placeOrder: (order, products, total,address) => {
        console.log(address,"11111111");
        return new Promise(async(resolve, reject) => {
          let status = order['payment-method'] === 'COD' ? 'placed' : 'pending';
          const date = new Date();
          console.log(order,"order");
          let orderObj = {
            user: ObjectId(order.userId),
            address: ObjectId(order.address),
            Name: address.name,
            phone: address.phone,
            email: order.email,
            paymentMethod: order['payment-method'],
            products: products.products,
            totalAmount: total,
            
            status: status,
            date:new Date()
          }
          if(order.coupon){
 
            await db.get().collection(collection.COUPON_COLLECTION).updateOne({name:order.coupon},
              {
                $push:{
                  user:ObjectId(order.userId)
                }
              })
           
           }
          console.log("ORRRderObj", orderObj);
          db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)
    
            .then((response) => {
              console.log("RRRRRRRRR", response);
              if(status==='placed')
              {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) });
              }
             
              console.log("RESPPPPP", response.insertedId, );
              console.log(orderObj.totalAmount ,"fddddddddddddddddddddddddddddddddddddddddddd");
              resolve(response.insertedId)
    
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        })
      },
      getCartProductList: async (userId) => {
        console.log(userId)
        let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
        console.log("CARRRRT", cart);
        return cart
    
      },
    
      getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
          console.log(userId);
          let orders = await db.get().collection(collection.ORDER_COLLECTION)
            .find({ user: ObjectId(userId) }).sort({ date: -1 }).toArray()
          console.log(orders);
          resolve(orders)
        })
      },
      addAddress: (address) => {
        return new Promise(async (resolve, reject) => {
    console.log(address,"1234567");
          let addressObj = {
            user: ObjectId(address.userId),
            name: address.name,
            phone: address.phone,
            billing_address: address.billing_address,
            billing_address2: address.billing_address2,
            city: address.city,
            state: address.state,
            pincode: address.zipcode
          }
          await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj)
            .then((data) => {
              resolve(data.insertedId);
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        });
      },
      getAllAddresses: (userId) => {
        return new Promise(async (resolve, reject) => {
          let addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ user: ObjectId(userId) }).toArray()
          resolve(addresses);
        })
      },
      deleteAddress: (addressId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: ObjectId(addressId) })
            .then((response) => {
              console.log(response);
              resolve(response)
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        })
      },
      getAddressDetails: (addressId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: ObjectId(addressId) })
            .then((address) => {
              console.log(address,"lllllllll")
              resolve(address)
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        })
      },
      updateAddress: (addressId, addressDetails) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ADDRESS_COLLECTION)
            .updateOne({ _id: ObjectId(addressId) }, {
              $set: {
                name:addressDetails.name,
                billing_address: addressDetails.billing_address,
                billing_address2: addressDetails.billing_address2,
                city: addressDetails.city,
                state: addressDetails.state,
                zipcode: addressDetails.zipcode
              }
            })
            .then((response) => {
              resolve()
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        })
      },
    
      getOrderDetails: (orderId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) })
            .then((order) => {
              resolve(order)
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        })
      },
      getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
    
          let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match: { _id: ObjectId(orderId) }
            },
            {
              $unwind: '$products'
            },
            {
              $project: {
                item: '$products.item',
                quantity: '$products.quantity'
              }
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
    
              }
            }
          ]).toArray()
          resolve(orderItems)
        })
      },
      getShipAddress: (orderId) => {
    
        return new Promise(async (resolve, reject) => {
    
          let addressList = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match: { _id: ObjectId(orderId) }
            },
            {
              $lookup: {
                from: collection.ADDRESS_COLLECTION,
                localField: 'address',
                foreignField: '_id',
                as: 'address'
              }
            },
            {
              $project: {
                address: { $arrayElemAt: ['$address', 0] }
    
              }
            }
          ]).toArray()
          console.log(addressList);
          resolve(addressList);
        })
      },
      cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
          {
            $set: {
              status: 'cancelled'
            }
          })
            .then((response) => {
              console.log(response);
              resolve(response)
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        })
      },
      
    
      getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
          let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ date: -1 }).toArray()
          resolve(orders)
        })
      },
      updateStatus: (orderId, orderDetails) => {
        console.log(orderId);
        console.log(orderDetails.status)
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({ _id: ObjectId(orderId) }, {
              $set: {
    
                status: orderDetails.status
    
              }
            })
            .then((response) => {
              console.log(response);
              resolve()
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error}`);
            });
        })
      },
      verifyPayment: (details) => {
        try {
          return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'ovkARhoaZOQ7sAlo7AGQaFE0');
            console.log(hmac);
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
              resolve()
            } else {
              reject()
            }
    
          })
    
        } catch (error) {
          console.log(error)
        }
    
      }
      ,
     
      changePaymentStatus: (orderId) => {
        console.log(orderId)
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({ _id: ObjectId(orderId) },
              {
                $set: {
                  status: 'placed'
                }
              }
            ).then(() => {
              resolve()
            })
        })
      },
      updateWallet: (total, userId) => {
        let amount = parseInt(total);
        return new Promise(async (resolve, reject) => {
          let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: ObjectId(userId) })
          const balance = Math.abs(wallet.balance);
          console.log(balance, "BALANCE AMount");
          if (balance < amount) {
            let outOfCash = false;
            resolve({ outOfCash: true })
          } else {
            // update the balance in the wallet
            db.get().collection(collection.WALLET_COLLECTION)
              .updateOne({ user: ObjectId(userId) },
                {
                  $inc: { balance: -amount }
                }
              ).then(() => {
                let walletSuccess = false;
                resolve({ walletSuccess: true })
              })
    
          }
    
    
    
        })
      },
      removeCartItems: (userId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })
    
            .then((response) => {
              resolve({})
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
    
            });
    
    
    
        })
    
    
    
    
      },
      returnOrder: (orderId) => {
        console.log(orderId)
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({ _id: ObjectId(orderId) },
              {
                $set: {
                  status: 'Return'
                }
              }
            ).then(() => {
              resolve()
            })
        })
      },
      getBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
      },
      generateRazorpay: (orderId, total) => {
        console.log('generate razorpay');
        console.log("orderid", orderId);
        return new Promise((resolve, reject) => {
    
    
          var options = {
            amount: total * 100, //amount in the smallest currency unit
            currency: "INR",
            receipt: orderId + ""
          };
    
          instance.orders.create(options, function (err, order) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("New Order:", order);
              resolve(order)
            }
    
          });
    
        })
      },
      
      applyCoupon: (details, userId, date, totalAmount) => {
        console.log(details, "RaRARARARARA");
        return new Promise(async (resolve, reject) => {
          let response = {};
      
          let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ name: details.coupon });
          if (coupon) {
            const expDate = new Date(coupon.expiryDate);
      
            response.couponData = coupon;
            console.log(coupon, "Chukaprasad");
      
            let user = await db.get().collection(collection.COUPON_COLLECTION).findOne({ name: details.coupon, Users: ObjectId(userId) });
      
            if (user) {
              response.used = "Coupon Already Applied";
              console.log("Already Applied");
              resolve(response);
            } else {
              if (date <= expDate) {
                response.dateValid = true;
                console.log('date ok');
      
                if (totalAmount >= coupon.minAmount) {
                  response.verifyMinAmount = true;
                  console.log('min ok');
                  console.log(totalAmount, "Local");
      
                  if (totalAmount >= coupon.maxDiscount) {
                    response.verifyMaxAmount = true;
                    console.log('max ok');
                  } else {
                    response.maxAmountMsg = "Your Maximum Purchase should be " + coupon.maxDiscount;
                    response.maxAmount = true;
                    console.log('max not ok');
                  }
                } else {
                  response.minAmountMsg = "Your Minimum purchase should be " + coupon.minAmount;
                  response.minAmount = true;
                }
      
                if (response.verifyMinAmount && response.verifyMaxAmount) {
                  response.verify = true;
                  await db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                    {
                      $set: {
                        coupon: ObjectId(coupon._id)
                      }
                    });
                }
                console.log('invalid date',response);
                resolve(response);
              } else {
                response.invalidDateMsg = 'Coupon Expired';
                response.invalidDate = true;
                response.Coupenused = false;
                console.log('invalid date',response);
              
                resolve(response);
              }
            }
      
          } else {
            response.invalidCoupon = true;
            response.invalidCouponMsg = "Invalid Coupon";
            resolve(response);
          }
        });
      },
     
      couponVerify:(userId)=>{
        return new Promise(async(resolve,reject)=>{
    console.log(userId,"99999999999999999999999999");
          let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
          
         
          if(userCart.coupon){
              
            let couponData=await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:ObjectId(userCart.coupon)});
           console.log(couponData,"8888888888888888");
            resolve(couponData)
          }
          resolve(userCart);
          console.log(userCart,"HUHUHUHHUHUHUHUHHHUHUHUHUHUHUHUHUH");
        
    
        })
    
      },
   
    
      removeCoupon:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},{
              $unset:{
                coupon:""
              }
            }).then((response)=>{
              resolve(response)
            })
        })
      },
      getUserCart:(userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) });
            resolve(userCart);
          } catch (error) {
            reject(error);
          }
        });
      },
      getDayWiseSales: () => {
        return new Promise(async (resolve, reject) => {
    
          let dayWiseSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match:
              {
                status: "Delivered",
              },
            },
            {
              $group: {
                _id: {
                  day: {
                    $dayOfWeek: "$date",
                  },
                },
                total: {
                  $sum: "$totalAmount",
                },
              },
            },
            {
              $project: {
                daywise: "$_id.day",
                _id: 0,
                total: 1,
              },
            },
            {
              $sort: {
                daywise: 1,
              },
            },
            {
              $project: {
                days: {
                  $arrayElemAt: [
                    [
                      "",
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ],
                    "$daywise",
                  ],
                },
                total: 1,
              },
            },
          ]).toArray()
    
          resolve(dayWiseSales)
    
    
        })
      },
      getMonthlySales: () => {
        return new Promise(async (resolve, reject) => {
          let monthlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match: {
                status: "Delivered",
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                },
                total: { $sum: "$totalAmount" },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
            {
              $project: {
                month: {
                  $concat: [
                    {
                      $cond: {
                        if: { $lt: ["$_id.month", 10] },
                        then: "0",
                        else: "",
                      },
                    },
                    { $toString: "$_id.month" },
                    "/",
                    { $toString: "$_id.year" },
                  ],
                },
                total: 1,
                _id: 0,
              },
            },
          ]).toArray();
      
          resolve(monthlySales);
        });
      },
      getCategoryQty: () => {
        return new Promise(async (resolve, reject) => {
          let categoryQuantity = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match:
    
              {
                status: "Delivered",
              },
            },
            {
              $unwind:
    
              {
                path: "$products",
              },
            },
            {
              $lookup:
    
              {
                from: "product",
                localField: "products.item",
                foreignField: "_id",
                as: "Data",
              },
            },
            {
              $project:
    
              {
                category: "$Data.category",
                Quantity: "$Data.Stock",
              },
            },
            {
              $group:
    
              {
                _id: "$category",
                Quantity: {
                  $sum: 1,
                },
              },
            },
            {
              $unwind:
    
              {
                path: "$_id",
              },
            },
          ]).toArray()
          resolve(categoryQuantity)
        })
      },
      getRevenue: () => {
        return new Promise(async (resolve, reject) => {
          let revenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match:
    
              {
                status: "Delivered",
              },
            },
            {
              $project:
    
              {
                _id: 0,
                totalAmount: 1,
              },
            },
            {
              $group:
    
              {
                _id: "",
                revenue: {
                  $sum: "$totalAmount",
                },
              },
            },
            {
              $project:
    
              {
                _id: 0,
                revenue: 1,
              },
            },
          ]).toArray()
          resolve(revenue)
        })
      },
      getOrdersCount: () => {
        return new Promise(async (resolve, reject) => {
          let ordersCount = db.get().collection(collection.ORDER_COLLECTION).countDocuments({ status: "Delivered" })
          resolve(ordersCount)
        })
      },
      getProductCount: () => {
        return new Promise(async (resolve, reject) => {
          let productCount = db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({})
          resolve(productCount)
        })
      },
      getCategoryCount: () => {
        return new Promise(async (resolve, reject) => {
          let categoryCount = db.get().collection(collection.CATEGORY_COLLECTION).countDocuments({})
          resolve(categoryCount)
        })
      },
      getMonthlyIncome: () => {
        return new Promise(async (resolve, reject) => {
          let monthlyIncome = db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match:
    
              {
                status: "Delivered",
              },
            },
            {
              $group:
    
              {
                _id: {
                  month: {
                    $month: "$date",
                  },
                },
                total: {
                  $sum: "$totalAmount",
                },
              },
            },
            {
              $group:
    
              {
                _id: "_id",
                AverageValue: {
                  $avg: "$total",
                },
              },
            },
            {
              $project:
    
              {
                _id: 0,
                AverageValue: 1,
              },
            },
          ]).toArray()
          resolve(monthlyIncome)
        })
      },getAllSales: () => {
        return new Promise(async (resolve, reject) => {
          
          let sales = await db.get().collection(collection.ORDER_COLLECTION).find({ status: 'Delivered' }).sort({ date: -1 }).toArray()
          console.log(sales,"");
          resolve(sales)
        })
      },
      getAllSalesInDateRange: (date1, date2) => {
        // let beginning = new Date(details.startDate);
        // let beg_utc = beginning.toISOString().replace("Z","+00:00");
        // let ending = new Date(details.endDate);
        // let end_utc = ending.toISOString().replace("Z","+00:00");
        // console.log('beg',beg_utc);
        return new Promise(async (resolve, reject) => {
          try {
            const sales = await db.get().collection(collection.ORDER_COLLECTION)
              .aggregate([
                {
                  $match: {
                    status: 'Delivered',
                    date: {
                      $gte: new Date(date1),
                      $lte: new Date(date2)
                    },
                  },
                }
              ]).toArray()
            
            console.log("Sale", sales);
            
            resolve(sales);
          } catch (error) {
            console.log("Error fetching sales: ", error);
            reject(error);
          }
        });
      },
      getWishListProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
    
          let wishListItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
            {
              $match: { user: ObjectId(userId) }
            },
            {
              $unwind: '$products'
            },
            {
              $project: {
                item: '$products.item'
              }
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $project: {
                item: 1, product: { $arrayElemAt: ['$product', 0] }
    
              }
            }
          ]).toArray()
          resolve(wishListItems)
          console.log("cartItems", wishListItems);
        })
      },
      getWishListCount: (userId) => {
        return new Promise(async (resolve, reject) => {
          let count = 0
          let wishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
          console.log(wishList);
          if (wishList) {
            count = wishList.products.length
    
          }
          resolve(count)
    
        })
      },
      addToWishList: (proId, userId) => {
        let proObj = {
          item: ObjectId(proId)
        }
        return new Promise(async (resolve, reject) => {
          let userWishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
          let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) })
          if (userWishList) {
            let proExist = userWishList.products.findIndex(product => product.item == proId)
            if (proExist != -1 && product && product.Quantity > 0) {
              resolve({ outOfStock: false })
    
            } else if (product && product.Quantity < 1) {
              resolve({ outOfStock: true })
    
            }
            else {
              db.get().collection(collection.WISHLIST_COLLECTION)
                .updateOne({ user: ObjectId(userId) },
                  {
    
                    $push: { products: proObj }
    
                  }
                ).then((response) => {
                  resolve()
                })
            }
          }else if (product && product.Quantity < 1) {
            // check the availability of the product in the inventory
            resolve({ outOfStock: true })
    
          } 
          else {
            let wishListObj = {
              user: ObjectId(userId),
              products: [proObj]
            }
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then((response) => {
              console.log(response);
              resolve()
            })
          }
    
        })
      },
      removeWishListProduct: (details) => {
        return new Promise((resolve, reject) => {
    
          db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({ _id: ObjectId(details.wishlist) },
              {
                $pull: { products: { item: ObjectId(details.product) } }
              }
            )
            .then((response) => {
              resolve({ removeProduct: true })
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
    
            });
    
    
        })
    
    
    
    
      },
      addToWallet:(userId,refund)=>{
        let amount =parseInt(refund)
        return new Promise(async(resolve,reject)=>{
          let userWallet=await db.get().collection(collection.WALLET_COLLECTION).findOne({user:ObjectId(userId)})
          if(userWallet){
            db.get().collection(collection.WALLET_COLLECTION).updateOne({user:ObjectId(userId)},
            {
              $inc:{balance:amount}
            }).then(()=>{
              resolve()
            })
            
          }
          else{
            let balanceObj={
              user:ObjectId(userId),
              balance:amount
            }
            db.get().collection(collection.WALLET_COLLECTION).insertOne(balanceObj).then((response)=>{
              resolve()
            })
          }
        })
      },
      // Helpers
checkUserExists: (userData) => {
  let response = {};
  console.log(userData);
  return new Promise(async (resolve, reject) => {
    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ number: userData.phone });
    if (user) {
      response.status = true;
      response.userExists=true
      response.user = user;
      resolve(response);
    } else {
      response.status = false;
      resolve(response);
    }
  });
},

sendForgotPasswordOTP: (user) => {
  return new Promise((resolve, reject) => {
    Client.verify.services(SERVICE_ID)
      .verifications
      .create({ to: `+91${user.number}`, channel: 'sms' })
      .then((data) => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
},

verifyForgotPasswordOTP: (confirmotp, userData) => {
  return new Promise((resolve, reject) => {
    Client.verify.services(SERVICE_ID)
      .verificationChecks.create({
        to: `+91${userData.number}`,
        code: confirmotp.phone
      })
      .then(async (data) => {
        if (data.status === 'approved') {
          resolve({ status: true });
        } else {
          resolve({ status: false });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
},

updatePassword: (newPassword, userData) => {
try{  console.log(typeof newPassword.confirmPassword,"password")
  let newPass= newPassword.confirmPassword.toString()


  return new Promise(async (resolve, reject) => {
try{    
  console.log(newPass,"helloooo")
  
newPass = await bcrypt.hash(newPass, 10);

    
    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: userData._id }, { $set: { password: newPass } })
      .then(() => { 
        console.log("resolved ")
        resolve();
      })
      .catch((error) => {
        console.log(error,".catch error");
      });
    }

    catch(error){
      console.log(error,"try catch error")
    }
  
    });

}
  catch(err){
    console.log(err,"error in update password")
  }
},
}