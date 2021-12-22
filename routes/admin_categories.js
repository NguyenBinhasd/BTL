var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
 //cho thêm isAdmin vào mỗi phần get để khi mà người dùng bấm /admin/... trên thanh url thì sẽ không đc nữa


//get Category models, lấy Category từ category.js trong models
var Category = require('../models/category');



/*
* get category index
*/
//   localhost:3000/admin/categories  đường dẫn thiết lập bên index.js ngoài cùng
router.get('/', isAdmin, function(req, res) {
    Category.find(function(err, categories) {
        if (err) return console.log(err);

        res.render('admin/categories', { 
            categories: categories 
        });
    });
});





//get add page render ra trang thêm trang của admin còn cái này /admin/categories/add-category
router.get('/add-category', isAdmin,  function(req, res) {
    
    var title = "";

    res.render('admin/add-category', {
        title: title,
    });

});
//post add page  thêm category
router.post('/add-category', function(req, res) {
    
    req.checkBody('title', 'Title must have value').notEmpty();
    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if(errors){ //lỗi thì hiển thị thông báo ko đc để trống
        res.render('admin/add-category', {
            errors: errors,
            title: title,
        });
    }else{
        Category.findOne({slug: slug}, function(err, category) {
            if(category){  //findOne khi thêm, nếu cái page đấy tồn tại thì in ra lỗi 
                req.flash('danger', 'Category title exists, choose another');
                res.render('admin/add-category', {
                    title: title,
                });
            } else {    //add vào mongoDB
                var category = new Category({
                    title: title,
                    slug: slug,
                });

                category.save(function(err) {
                    if (err) 
                        return console.log(err);

                    Category.find(function(err, categories) {  //thêm cái này vào post của add và edit, delete để khi thay ở admin thì bên home sẽ tự thay đổi chứ ko cần pải restart lại server
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories; //tạo cái categories thành local để có thể xài ở bất kì đâu, hiện tại đang dùng để xài trong index.ejs
                        }
                    });
                    
                    req.flash('success', 'Category added successfully!!!');
                    res.redirect('/admin/categories');                 
                })
            }
        });
    }

})

//get trang sửa thông tin
router.get('/edit-category/:id', isAdmin, function(req, res) {   

    Category.findById( req.params.id , function(err, category) {
        if(err) console.error(err);

        res.render('admin/edit-category', {
            title: category.title,
            id: category._id,
        });
    });
});
//sửa trang
router.post('/edit-category/:id', function(req, res) {
    
    req.checkBody('title', 'Title must have value').notEmpty();
    
    var title = req.body.title;
    var id = req.params.id;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if(errors){ //lỗi thì hiển thị thông báo ko đc để trống
        res.render('admin/edit-category', {
            errors: errors,
            title: title,
            id: id,
        });
    }else{
        Category.findOne({slug: slug, _id:{'$ne': id}}, function(err, category) {
            if(category){  //findOne khi thêm, nếu cái page đấy tồn tại thì in ra lỗi 
                req.flash('danger', 'Category title exists, choose another');
                res.render('admin/edit-category', {
                    title: title,
                    id: id,
                });
            } else {    //tìm bằng id và sửa
                Category.findById(id, function(err, category) {
                    if(err)  return console.error(err); 
                    //title của page sẽ bằng title mới,...

                    category.title = title;
                    category.slug = slug;

            
                    category.save(function(err) {
                        if (err) 
                            return console.log(err);
                
                        Category.find(function(err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories; //tạo cái categories thành local để có thể xài ở bất kì đâu, hiện tại đang dùng để xài trong index.ejs
                            }
                        });

                        req.flash('success', 'Category edited successfully!!!');
                        res.redirect('/admin/categories');
                    })
                });      
            }
        });
    }

})

//get trang xóa trang 
router.get('/delete-category/:id', isAdmin, function(req, res) {
    Category.findByIdAndRemove(req.params.id, function(err, category) {
        if(err) 
            return console.log(err);

        Category.find(function(err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories; //tạo cái categories thành local để có thể xài ở bất kì đâu, hiện tại đang dùng để xài trong index.ejs
            }
        });

        req.flash('success', 'Category deleted successfully!!!');
        res.redirect('/admin/categories/')
    });
});


module.exports = router;