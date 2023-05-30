var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path')
const adminController = require('../controller/admin-controller');
const productHelpers=require('../helpers/product-helpers')
const middleware=require('../middleware/middleware');
const imgUpload = require("../middleware/multer");

// Banner Multer
var storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        cb(null, './public/ban-images')
       
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '- ' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var uploadBan = multer({
    storage: storage
  }
  )
  var multipleBanUpload = uploadBan.fields([{ name: 'bImage'}])
// router.get("/", function (req, res) {
//   res.render("admin/login" );
// });

router.get("/",adminController.getLogin)

router.post("/",adminController.postLogin)

router.get("/admin-dashboard",middleware.isAdmin,adminController.getHome)
// router.get("/admin-dashboard", function (req, res) {
//   res.render("admin/admin-dashboard", { admin:true,layout: "admin-layout" });
// });
router.get("/add-products",middleware.isAdmin,adminController.getAddProducts)
// router.get("/add-products", function (req, res) {
//   res.render("admin/add-products",{admin:true,layout:"admin-layout"});
// });
router.post("/add-products",imgUpload.uploads,adminController.postAddProducts)

// router.post('/add-products',(req,res)=>{
//   productHelpers.addProduct(req.body,(id)=>{
//     let image=req.files.image
//     image.mv('./public/product-images/'+id+'.jpg',(err)=>{
//       if(!err){
//         res.redirect('/admin/add-products' )
//       }
//     })
//   })
// })
router.get("/view-products",middleware.isAdmin,adminController.getAllProducts)
router.get("/delete-products/:id",middleware.isAdmin,adminController.getdeleteProduct)
router.get("/edit-products/",middleware.isAdmin,adminController.geteditProduct)
router.post("/edit-products/:id",imgUpload.editeduploads,adminController.posteditProduct)
router.get("/blockPro",adminController.blockProducts)
router.get("/unBlockPro",adminController.unBlockProducts)
// router.get("/view-products", function (req, res) {
//   productHelpers.getAllProducts().then((products)=>{
//     console.log(products);
//     res.render("admin/view-products", { admin:true,products,layout: "admin-layout" });
//   })
router.get("/view-users",middleware.isAdmin,adminController.getuserList)
router.get("/blockUser",adminController.blockUser) 
router.get("/unBlockUser",adminController.unBlockUser)

router.get('/add-category',middleware.isAdmin,adminController.addCategory)
router.get('/view-category',middleware.isAdmin,adminController.getCategory)
router.get('/edit-category/',middleware.isAdmin,adminController.editCategory)
router.post('/add-category',adminController.addCategoryIm)
router.post('/edit-category/:id',adminController.editCategoryIm)
router.get("/blockCat",adminController.blockCat)
router.get("/unBlockCat",adminController.unBlockCat)

router.get('/delete-category/:id',middleware.isAdmin,adminController.deleteCategory)

// router.post('/edit-category',adminController.editCategoryIm)
// });
// router.get("/add_sub", function (req, res) {
//   res.render("admin/add-subcategory", { layout: "adminLayout" });
// });
router.get('/banner',middleware.isAdmin,adminController.Banner)
router.get('/addBanner',middleware.isAdmin,adminController.addBanner)
router.post('/addBanner1',multipleBanUpload,adminController.postBanner)
//
router.get('/orders',middleware.isAdmin,adminController.getOrder);
router.get('/view-order-products/:id',adminController.getOrderDetails);
router.post('/order-status/:id',adminController.postEditStatus);
//
router.get('/coupons',middleware.isAdmin,adminController.getcoupon)
router.get('/addCoupons',adminController.addCoupon)
router.post('/admin-addCoupon',adminController.postCoupon)
//
router.get('/sales',middleware.isAdmin,adminController.getSales);
router.post('/sales',middleware.isAdmin,adminController.getSalesFilter);
//
router.get('/logout',adminController.getLogout)
module.exports = router;
