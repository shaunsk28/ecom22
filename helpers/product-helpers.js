var db = require('../config/connection')
var collection=require('../config/collections');
const async = require('hbs/lib/async');
const { ObjectId } = require('mongodb');

var objectId=require('mongodb').ObjectId
module.exports={
    addProduct:(product,callback)=>{
        // console.log(product);

        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            //  console.log(data,"01234567890987654320987654321");
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
        
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    getAllProducts1:(isActive,search,page,limit)=>{
      return new Promise(async(resolve,reject)=>{
        console.log("qqqqqqqq",page,"eeeeeeeeeeeeeee");
          let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{Name:{$regex:'.*'+search+'.*',$options:'i'}},{category:{$regex:'.*'+search+'.*',$options:'i'}},{Price:{$regex:'.*'+search+'.*',$options:'i'}},{Description :{$regex:'.*'+search+'.*',$options:'i'}}]}).sort({ Price: 1 }).limit(limit*1).skip((page-1)*limit).toArray()
          resolve(products)
      })
  },
    getProductsPageCount:(search,page,limit)=>{
        return new Promise(async(resolve,reject)=>{
          let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{Name:{$regex:'.*'+search+'.*',$options:'i'}},{category:{$regex:'.*'+search+'.*',$options:'i'}},{Price:{$regex:'.*'+search+'.*',$options:'i'}},{Description :{$regex:'.*'+search+'.*',$options:'i'}}]}).sort({ Price: 1 }).limit(limit*1).skip((page-1)*limit).toArray()
          let count=await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({$or:[{Name:{$regex:'.*'+search+'.*',$options:'i'}},{category:{$regex:'.*'+search+'.*',$options:'i'}},{Price:{$regex:'.*'+search+'.*',$options:'i'}},{Description :{$regex:'.*'+search+'.*',$options:'i'}}]})
          resolve(count)
        })
      },
    // getAllProducts: (search) => {
    //     return new Promise(async (resolve, reject) => {
    //       try {
            
    //         const products = await db.get().collection(collection.PRODUCT_COLLECTION)
    //           .find({
    //             $or: [
    //               { Name: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { category: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { Price: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { Description: { $regex: '.*' + search + '.*', $options: 'i' } }
    //             ]
    //           })
    //           .toArray();
    //           console.log("qqqqqq",products,"eeeeee" );
    //         resolve(products);
            
    //       } catch (error) {
    //         reject(error);
    //       }
    //     });
    //   },
    //   getProductsPageCount: (search) => {
    //     return new Promise(async (resolve, reject) => {
    //       try {
            
    //         const products = await db
    //           .get()
    //           .collection(collection.PRODUCT_COLLECTION)
    //           .find({
    //             $or: [
    //               { Name: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { category: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { Price: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { Description: { $regex: '.*' + search + '.*', $options: 'i' } }
    //             ]
    //           })
    //           .sort({ Price: 1 })
              
    //           .toArray();
    //         const count = await db
    //           .get()
    //           .collection(collection.PRODUCT_COLLECTION)
    //           .countDocuments({
    //             $or: [
    //               { Name: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { category: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { Price: { $regex: '.*' + search + '.*', $options: 'i' } },
    //               { Description: { $regex: '.*' + search + '.*', $options: 'i' } }
    //             ]
    //           });
    //         resolve(count);
    //       } catch (error) {
    //         reject(error);
    //       }
    //     });
    //   },
      

    deleteProduct:(productId)=>{
        // console.log(productId,"1111111111111111111111111111111111111111111");
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(productId)=>{
        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",productId);
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product)=>{
                resolve(product)
             })
        })
    }, 
    updateProduct:(productId,proDetails)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category,
                    Quantity:proDetails.Quantity
                }
            }).then((response)=>{
                resolve()
            })
                
        })
    },
    getCategoryWiseProducts:async(catId)=>{
      
        return new Promise(async(resolve,reject)=>{
            console.log(catId,"catId");
            let categoryId = new ObjectId(catId);         
               let category = await db.get().collection(collection.CATEGORY_COLLECTION).find({_id:categoryId}).toArray()
               let categoryOne = category[0];
               let catName = categoryOne.category;
            console.log(categoryOne.category,"hhhhhhhhh");
          let categoryDetails=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:catName}).toArray()
          console.log("11111111111111111",categoryDetails,"111111111111111111111111111111111")
        //   let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:categoryDetails.products}).toArray()
        //   console.log(products,"heyy")
          resolve(categoryDetails)
        })
      },
      getInventory: (proId) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.PRODUCT_COLLECTION)
            .find({ _id: objectId(proId) }, { Stock: 1 })
            .toArray()
            .then((inventory) => {
              if (inventory.length > 0) {
                const quantity = inventory[0].Stock;
              
                resolve(quantity);
              } else {
          
                resolve(0);
              }
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
      
}