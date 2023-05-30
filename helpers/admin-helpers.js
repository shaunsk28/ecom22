var db = require('../config/connection')
var collection=require('../config/collections');
const async = require('hbs/lib/async');
const bcrypt=require('bcrypt');
const { resolve } = require('promise');
var ObjectId=require('mongodb').ObjectId
module.exports={
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    }, 
    // updateUserStatus:(blockUserId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //      db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(blockUserId)},
    //      {  
   
    //        $set:{isblocked:true}
    //      })
    //     }).then((response)=>{
    //      resolve()
    //     })
    //  },
    //  setUserStatus:(unBlockUserId)=>{
    //     return new Promise((resolve,reject)=>{
    //      db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(unBlockUserId)},
    //      {
    //        $set:{isblocked:false}
    //      })
    //     }).then((response)=>{
        
    //      resolve()
   
    //     })
    //  },
     updateUserStatus: (blockUserId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: ObjectId(blockUserId) },
            { $set: { isblocked: true } }
          );
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    },
    
    setUserStatus: (unBlockUserId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: ObjectId(unBlockUserId) },
            { $set: { isblocked: false } }
          );
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    }, updateproStatus: (blockProId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
            { _id: ObjectId(blockProId) },
            { $set: { isActive: false } }
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    
    setproStatus: (unBlockProId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
            { _id: ObjectId(unBlockProId) },
            { $set: { isActive: true } }
          );
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    },
    
    updateCatStatus: (blockCatId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const catName = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(blockCatId)})
          db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
            { _id: ObjectId(blockCatId) },
            { $set: { isBlocked: true} }
          );
          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({category:catName.category},
            { $set: { isActive: false } }
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    setCatStatus: (unBlockCatId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const catName = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(unBlockCatId)})
          db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
            { _id: ObjectId(unBlockCatId) },
            { $set: { isBlocked: false} }
          );
          db.get().collection(collection.PRODUCT_COLLECTION).updateMany({category:catName.category},
            { $set: { isActive: true } }
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
     addCategory:(categoryName)=>{
        return new Promise((resolve,reject)=>{
           
          
          db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryName).then((data)=>{
              console.log("shyaijk",data,"gayhjs")
              resolve(data.insertedId)
            })
          })


     },
     
     getAllCategories:()=>{
        return new Promise(async(resolve,reject)=>{
          let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
          resolve(categories)
        })
    
      },
      getProductCategory:()=>{
        return new Promise ((resolve,reject)=>{
        let category = db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        resolve(category);
        })
       
      },
    getCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(categoryId)}).then((category)=>{
                resolve(category)
                // console.log(category,"kiduki");
            })
        })
    },
    deleteCategories:(categoryId)=>{
        console.log(categoryId);
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(categoryId)}).then((response)=>{
            resolve(response)
          })
        })
    }, 
    editCategory:(categoryId,categoryDetails)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:ObjectId(categoryId)},{
            $set:{
              category:categoryDetails.category,
              subCategory:categoryDetails.subCategory
            }
          }).then((response)=>{
            resolve()
          })
        })
      },addBanner:(banner)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data)=>{
            resolve(data)
          })
          
        })
      },
      getBanner:()=>{
        return new Promise(async(resolve,reject)=>{
          banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
          resolve(banner)
        })
      },
      addCoupon:(couponDetails)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.COUPON_COLLECTION).insertOne({ name: couponDetails.couponName, code: couponDetails.couponId, maxDiscount: couponDetails.maxdiscount, minAmount: couponDetails.minAmount, expiryDate: couponDetails.expDate,couponPercentage:couponDetails.couponPercentage, status: true }).then((response)=>{
            response.message = 'Coupon Added successfully'
            response.status = false
            resolve(response)
          })
          
        })
      },
      getAllCoupons:(coupon)=>{
        return new Promise(async(resolve,reject)=>{
         let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
         resolve(coupon)
         console.log(coupon,"hiDA ");
        })
      },

}