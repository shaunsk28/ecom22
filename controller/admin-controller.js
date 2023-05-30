var db = require('../config/connection')
var session = require('express-session')
var adminHelpers = require('../helpers/admin-helpers')
var productHelpers = require('../helpers/product-helpers');
var userHelpers = require("../helpers/user-helpers")
const async = require('hbs/lib/async');
const user = require('./user-controller')
const multer = require('multer')
const path = require('path')

const emailDB = "shauns4422@gmail.com"
const passwordDB = "12345"

//add product with multer


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + file.originalname;
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});
const upload = multer({ storage: storage });
const add_image = upload.array("image", 12);

module.exports = {

    getLogin: (req, res) => {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        if (req.session.adminLogin) {
            console.log('99999999999999999999999999999999999999');
            res.redirect("/admin/admin-dashboard")
        }
        else {
            console.log('sdadsadsadsadsaas');
            res.render("admin/login", { "loginErr": req.session.loginErr, layout: "admin-layout" })
            req.session.loginErr = false
        }
    },
    postLogin: (req, res) => {
        let adminData = { email, password } = req.body;
        if (emailDB == email && passwordDB == password) {
            req.session.adminLogin = true;
            req.session.admin = adminData;
            res.redirect('/admin/admin-dashboard')
        }
        else (
            req.session.loginErr = true,
            res.redirect('/admin')
        )
            ;
    },
    getHome: async (req, res) => {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        let dayWiseSales = await userHelpers.getDayWiseSales()
        let monthlySales = await userHelpers.getMonthlySales();
        console.log(dayWiseSales, 'haiiiiiiiiii')
        let categoryQuantity = await userHelpers.getCategoryQty()
        let revenue = await userHelpers.getRevenue()
        let ordersCount = await userHelpers.getOrdersCount()
        let productCount = await userHelpers.getProductCount()
        let categoryCount = await userHelpers.getCategoryCount()
        let AverageValue = await userHelpers.getMonthlyIncome()
        AverageValue = AverageValue[0] && AverageValue[0].AverageValue
        console.log("AVG", AverageValue);
        revenue = revenue[0] && revenue[0].revenue
        console.log("REVENUEEEE", revenue);


        productHelpers.getAllProducts()
            .then((products) => {
                let admin = req.session.adminLogin
                res.render("admin/admin-dashboard", { layout: "admin-layout", admin, products, dayWiseSales,  monthlySales, categoryQuantity, revenue, ordersCount, productCount, categoryCount, AverageValue });

            })


    },
    getAddProducts: async (req, res) => {
        let admin = req.session.adminLogin
        let category = await adminHelpers.getProductCategory()
        res.render("admin/add-products", { layout: "admin-layout", admin, category })
    },
    postAddProducts: (req, res) => {

        let images = req.files.map(files => files.filename);
        req.body.images = images;
        console.log(req.files, "22222222222")
        productHelpers.addProduct(req.body, (id) => {

            res.redirect("/admin/add-products")


        })
    },
    getAllProducts: (req, res) => {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        let admin = req.session.adminLogin
        productHelpers.getAllProducts().then((products) => {
            console.log(products);
            res.render("admin/view-products", { admin, products, layout: "admin-layout" });
        })
    },
    getdeleteProduct: (req, res) => {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        let admin = req.session.adminLogin
        let productId = req.params.id
        productHelpers.deleteProduct(productId).then((response) => {
            res.redirect('/admin/view-products')
        })
    },
    geteditProduct: async (req, res) => {
        let admin = req.session.adminLogin
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        let category = await adminHelpers.getProductCategory();
        console.log(category, "fffffffffffffffffffffffffffffffffffff");
        console.log(req.query.id, "Nee shooperadadaaa");
        let product = await productHelpers.getProductDetails(req.query.id)
        console.log(product, "nee Polikkeda mone");
        res.render('admin/edit-products', { layout: 'admin-layout', admin, product, category })
    },
    posteditProduct: (req, res) => {
        console.log(req.body, "IVan Poliyada");
        productHelpers.updateProduct(req.params.id, req.body).then(() => {
            res.redirect('/admin/view-products')
        })
    },
    getuserList: (req, res) => {
        let admin = req.session.adminLogin
        adminHelpers.getAllUsers().then((user) => {
            res.render('admin/view-users', { layout: 'admin-layout', user, admin })
        })


    },
    blockUser: (req, res) => {
        let blockUserId = req.query.id
        adminHelpers.updateUserStatus(blockUserId)
        res.redirect('/admin/view-users')
    },
    unBlockUser: (req, res) => {
        let unBlockUserId = req.query.id
        adminHelpers.setUserStatus(unBlockUserId)
        res.redirect('/admin/view-users')
    },
    blockProducts: (req, res) => {
        let blockProId = req.query.id
        console.log(req.query.id, "1111111111111111");
        adminHelpers.updateproStatus(blockProId)
        res.redirect('/admin/view-products')
    },
    unBlockProducts: (req, res) => {
        let unBlockProId = req.query.id
        adminHelpers.setproStatus(unBlockProId)
        res.redirect('/admin/view-products')
    },
    getCategory: (req, res) => {
        let admin = req.session.adminLogin
        adminHelpers.getAllCategories().then((categories) => {
            res.render('admin/view-category', { admin, layout: 'admin-layout', categories });
        })
    },
    addCategory: (req, res) => {
        let admin = req.session.adminLogin
        res.render('admin/add-category', { layout: 'admin-layout', admin })


    },
    addCategoryIm: (req, res) => {
        console.log("ttttttttttttttt", req.body, "111111111111111");
        adminHelpers.addCategory(req.body).then(() => {
            // Retrieve the newly added category using the categoryId

            res.redirect('/admin/view-category')


        });
    },
    // addCategoryIm:(req,res)=>{
    //     adminHelpers.addCategory(req.body).then(()=>{
    //           res.redirect('/admin/add-category') 
    //        })
    // },
    editCategory: async (req, res) => {
        // console.log(req.query.id,"ivan poliyada");
        let admin = req.session.adminLogin
        let category = await adminHelpers.getCategory(req.query.id)
        res.render('admin/edit-category', { layout: 'admin-layout', admin, category })
    },
    editCategoryIm: (req, res) => {
        // console.log(req.body,"nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
        adminHelpers.editCategory(req.params.id, req.body).then(() => {
            let id = req.params.id;
            res.redirect('/admin/view-category')
        })
    },
    blockCat: (req, res) => {
        let blockCatId = req.query.id
        console.log(blockCatId, "1111111111111111")
        adminHelpers.updateCatStatus(blockCatId)
        res.redirect('/admin/view-category')
    },
    unBlockCat: (req, res) => {
        let unBlockCatId = req.query.id
        adminHelpers.setCatStatus(unBlockCatId)
        res.redirect('/admin/view-category')
    },
    deleteCategory: (req, res) => {
        // console.log("asdfghjklasdfghjk");
        let categoryId = req.params.id
        adminHelpers.deleteCategories(categoryId).then((response) => {
            res.redirect('/admin/view-category')
        })
    },
    Banner: (req, res) => {
        let admin = req.session.adminLogin
        adminHelpers.getBanner().then((banner) => {
            res.render('admin/banner', { layout: 'admin-layout', admin, banner })
        })

    },
    addBanner: (req, res) => {
        let admin = req.session.adminLogin
        res.render('admin/addBanner', { admin, layout: 'admin-layout' })

    },
    postBanner: (req, res) => {
        console.log(req.body, "11111111111111111111111111111111111111111111111111111111");
        req.body.image = req.files.bImage[0].filename
        adminHelpers.addBanner(req.body).then(() => {
            res.redirect('/admin/banner')
        })
    }, getOrder: async (req, res) => {
        userHelpers.getAllOrders()
            .then((orders) => {
                //   adminIn = req.session.loggedIn
                let admin = req.session.adminLogin
                res.render('admin/orders', { layout: 'admin-layout', admin, orders });
            })
            .catch(error => {
                console.error(`The operation failed with error: ${error.message}`);
            });
    },
    getOrderDetails: async (req, res) => {
        //  adminIn=req.session.loggedIn
        let admin = req.session.adminLogin
        let order = await userHelpers.getOrderDetails(req.params.id)
        let products = await userHelpers.getOrderProducts(req.params.id)
        let address = await userHelpers.getShipAddress(req.params.id)


        res.render('admin/orderDetails', { layout: 'admin-layout', admin, user, order, products, address })
    },
    postEditStatus: (req, res) => {
        console.log(req.params.id);
        console.log(req.body.status);
        userHelpers.updateStatus(req.params.id, req.body)
            .then(() => {
                res.redirect("/admin/orders");
            })
            .catch(error => {
                console.error(`The operation failed with error: ${error.message}`);
            });
    },
    getcoupon: (req, res) => {
        let admin = req.session.adminLogin
        adminHelpers.getAllCoupons().then((coupon) => {
            console.log("222222222222222222", coupon, "111111111111111111");
            res.render('admin/coupon', { admin, layout: 'admin-layout', coupon })
        })


    },
    addCoupon: (req, res) => {
        let admin = req.session.adminLogin
        res.render('admin/addCoupon', { layout: 'admin-layout', admin })
    },
    postCoupon: (req, res) => {
        adminHelpers.addCoupon(req.body).then(() => {
            res.redirect('/admin/addCoupons')
        })
    }, 
    getSales: async (req, res) => {
        userHelpers.getAllSales()
            .then((sales) => {
                let admin = req.session.adminLogin
                console.log(sales,"hiiiiii");
                res.render('admin/sales', { layout: 'admin-layout', admin, sales });
            })
            .catch(error => {
                console.error(`The operation failed with error: ${error.message}`);
            });
    },

    getSalesFilter: async (req, res) => {
        console.log("Date details", req.body);
        const date1 = new Date(req.body.startDate)
        const date2 = new Date(req.body.endDate)
        let sales = userHelpers.getAllSalesInDateRange(date1, date2)
            .then((sales) => {
                let admin = req.session.adminLogin
                res.render('admin/sales', { layout: 'admin-layout', admin, sales });
            })
            .catch(error => {
                console.error(`The operation failed with error: ${error.message}`);
            });
    },






    getLogout: (req, res) => {
        req.session.admin = null;
        req.session.adminLogin = false;
        console.log(req.session.admin, "hiiiiiiiiiiiiiii");
        res.redirect('/admin')
    },



}