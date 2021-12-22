var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;




var Product = require('../models/product');
var Category = require('../models/category');

//get all product
router.get('/', function(req, res) {

    //cong thuc lam dan trang
    var page = parseInt(req.query.page) || 1;
    var perPage = 12; //perpage la kieu moi page cos ? san pham

    var prevPage = parseInt(1); 
    var nextPage = parseInt(1);

    var start = (page - 1) * perPage; 
    var end = page * perPage;
    
    Product.find({}).sort({date: -1}).exec(function(err, products) {
        if (err) 
            return console.log(err);

        res.render('all-products', {
            title: 'All Products',
            products: products.slice(start,end),
            prevPage: prevPage,
            nextPage: nextPage,
            page: page,
        }); 
    });
});


//get product by category
router.get('/:category', function(req, res) {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function(err, category) {
        Product.find({category: categorySlug}, function(err, products) {
            if (err) 
                return console.log(err);
    
            res.render('cat-products', {
                title: category.title,
                products: products,
                category: category,
            }); 
        });
    });
});


//get product details
router.get('/:category/:product', function(req, res) {

    var galleryImages = null;

    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product}, function(err, product) { //trên này nè
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';
            //doc duong dan file
            fs.readdir(galleryDir, function(err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,  //oử đây, p đã trở thành nguyên cái product rồi, nên khi viết bên product.ejs có thể sử dụng các cái thành phần trong database product, product trên findONe kìa
                        galleryImages: galleryImages,
                        loggedIn: loggedIn,
                    });
                }
            });
        }
    });

});





module.exports = router;