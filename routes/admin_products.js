var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
 //cho thêm isAdmin vào mỗi phần get để khi mà người dùng bấm /admin/... trên thanh url thì sẽ không đc nữa



//get product models, lấy Product từ product.js trong models
var Product = require('../models/product');
//get category trong models
var Category = require('../models/category');
const { fsyncSync } = require('fs-extra');



/*
* get product index
*/
//   localhost:3000/admin/products  đường dẫn thiết lập bên index.js ngoài cùng
router.get('/', isAdmin, function(req, res) {
    var count;

    Product.count(function(err, c) {
        count = c;
    });

    Product.find(function(err, products) {
        res.render('admin/products', {
            products: products,
            count: count,
        });
    });
});





//get add product render ra trang thêm trang của admin còn cái này /admin/products/add-product
router.get('/add-product', isAdmin, function(req, res) {
    
    var title = "";
    var desc = "";
    var price = "";
    //để category bên ngoài khi thêm sản phẩm sẽ chọn sản phẩm đó thuộc danh mục nào, giống như thể loại truyện trong hako vaayk, truyện dịch, sáng tác, máy dich,...
    Category.find(function(err, categories) {
        res.render('admin/add-product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price,
        });
    });

});
//post add product  thêm sản phẩm
router.post('/add-product', function(req, res) {

    if(!req.files){ 
        imageFile =""; 
    }

    if(req.files){
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    } //imageFile khi làm ở mọi bài toán(chắc thế)
    
    req.checkBody('title', 'Title must have value').notEmpty();
    req.checkBody('desc', 'Description must have value').notEmpty();
    req.checkBody('price', 'Price must have value').isDecimal();
    req.checkBody("image", 'You must upload your image').isImage(imageFile);

    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;


    var errors = req.validationErrors();

    if(errors){ //lỗi thì hiển thị thông báo ko đc để trống
        Category.find(function(err, categories) {
            res.render('admin/add-product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price,
            });
        });
    }else{
        Product.findOne({slug: slug}, function(err, product) {
            if(product){  //findOne khi thêm, nếu cái product đấy tồn tại thì in ra lỗi 
                req.flash('danger', 'Product title exists, choose another');
                Category.find(function(err, categories) {
                    res.render('admin/add-product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price,
                    });
                });
            } else {    //add vào mongoDB

                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    price: price2,
                    desc: desc,
                    category: category,
                    image: imageFile,
                });

                product.save(function(err) {
                    if (err) 
                        return console.log(err);

                        fs.mkdir('public/product_images/' +product._id, { recursive: true }); //thực hiện tạo folder có tên là id của sản phẩm

                        fs.mkdirp('public/product_images/' +product._id + '/gallery', { recursive: true }); //thêm folder gellery sau cái folder trên

                        fs.mkdirp('public/product_images/' +product._id + '/gallery/thumbs', { recursive: true }); //tương tự
                        
                        if(imageFile != "") {
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + product._id + '/' + imageFile; //lưu ảnh vào folder id

                            productImage.mv(path, function(err) {
                                return console.log(err);
                            })
                        }

                        req.flash('success', 'Product added successfully!!!');
                        res.redirect('/admin/products');
                    
                });
            }
        });
    }

});

//get trang sửa product
router.get('/edit-product/:id', isAdmin, function(req, res) {

    var errors;

    if(req.session.errors) 
        errors = req.session.errors;
        req.session.errors = null;

    Category.find(function(err, categories) {

        Product.findById(req.params.id, function(err, product) {
            if(err){
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + product._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function(err, files) {
                    if(err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit-product', {
                            title: product.title,
                            errors: errors,
                            desc: product.desc,
                            categories: categories,
                            category: product.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(product.price).toFixed(2),
                            image: product.image,
                            galleryImages: galleryImages,
                            id: product._id,
                        });
                    }
                });
            }
        });

    });

});
//post trang sua product
router.post('/edit-product/:id', function(req, res) {
    if(!req.files){ 
        imageFile =""; 
    }

    if(req.files){
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    } //imageFile khi làm ở mọi bài toán(chắc thế)
    
    req.checkBody('title', 'Title must have value').notEmpty();
    req.checkBody('desc', 'Description must have value').notEmpty();
    req.checkBody('price', 'Price must have value').isDecimal();
    req.checkBody("image", 'You must upload your image').isImage(imageFile);

    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;


    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id:{'$ne': id}}, function (err, p) {
            if(err) 
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists choose another!!!');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function(err, p) {
                    if (err) 
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function(err) {
                        if(err) 
                            console.log(err);

                        if (imageFile != "") {
                            if(pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function(err) {
                                    if(err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile; //lưu ảnh vào folder id

                            productImage.mv(path, function(err) {
                                return console.log(err);
                            });
                        }

                        req.flash('success', 'Product edited successfully!!!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                        
                });
            }
        });
    }

});

//post product gallery
router.post('/product-gallery/:id', function(req, res) {
    
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function(err) {
        if (err) 
            console.log(err);

        resizeImg(fs.readFileSync(path), {width:100, height:100})
            .then(function(buf) {
                fs.writeFileSync(thumbsPath, buf);
            });
    });

    res.sendStatus(200);

});

//get delele gallery image
router.get('/delete-image/:image', isAdmin, function(req, res) {
    
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success','Image deleted');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });

});


//get trang xóa trang 
router.get('/delete-product/:id', isAdmin,  function(req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function(err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function(err) {
                console.log(err);
            });

            req.flash('success','Product deleted');
            res.redirect('/admin/products');
        }
    });
});


module.exports = router;