var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
 //cho thêm isAdmin vào mỗi phần get để khi mà người dùng bấm /admin/... trên thanh url thì sẽ không đc nữa


//get pages models, lấy Page từ page.js trong models
var Page = require('../models/page');



/*
* get page index
*/
//   localhost:3000/admin/pages  đường dẫn thiết lập bên index.js ngoài cùng
router.get('/', isAdmin, function(req, res) {
    Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
        res.render('admin/pages', {
            pages: pages,
        });
    });
});





//get add page render ra trang thêm trang của admin còn cái này /admin/pages/add-page
router.get('/add-page', isAdmin,  function(req, res) {
    
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add-page', {
        title: title,
        slug: slug,
        content: content,
    });

});
//post add page  thêm trang
router.post('/add-page', function(req, res) {
    
    req.checkBody('title', 'Title must have value').notEmpty();
    req.checkBody('content', 'Content must have value').notEmpty();
    
    var title = req.body.title;
    var content = req.body.content;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if(errors){ //lỗi thì hiển thị thông báo ko đc để trống
        res.render('admin/add-page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
        });
    }else{
        Page.findOne({slug: slug}, function(err, page) {
            if(page){  //findOne khi thêm, nếu cái page đấy tồn tại thì in ra lỗi 
                req.flash('danger', 'Page slug exists, choose another');
                res.render('admin/add-page', {
                    title: title,
                    slug: slug,
                    content: content,
                });
            } else {    //add vào mongoDB
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100,
                });

                page.save(function(err) {
                    if (err) 
                        return console.log(err);

                    Page.find({}).sort({sorting: 1}).exec(function(err, pages) { //thêm cái này vào để khi bên admin thêm page thì jome sẽ tự động thêm vào
                        if(err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });

                    req.flash('success', 'Page added successfully!!!');
                    res.redirect('/admin/pages');                  
                });
            }
        });
    }

})

//get trang sửa thông tin
router.get('/edit-page/:id', isAdmin,  function(req, res) {   

    Page.findById( req.params.id, function(err, page) {
        if(err) return console.error(err);

        res.render('admin/edit-page', {
            title: page.title,
            content: page.content,
            id: page._id,
        });
    });
});
//sửa trang
router.post('/edit-page/:id', function(req, res) {
    
    req.checkBody('title', 'Title must have value').notEmpty();
    req.checkBody('content', 'Content must have value').notEmpty();
    
    var title = req.body.title;
    var content = req.body.content;
    var id = req.params.id;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if(errors){ //lỗi thì hiển thị thông báo ko đc để trống
        res.render('admin/edit-page', {
            errors: errors,
            title: title,
            content: content,
            id: id,
        });
    }else{
        Page.findOne({slug: slug, _id:{'$ne': id}}, function(err, page) {
            if(page){  //findOne khi thêm, nếu cái page đấy tồn tại thì in ra lỗi 
                req.flash('danger', 'Page title exists, choose another');
                res.render('admin/edit-page', {
                    title: title,
                    content: content,
                    id: id,
                });
            } else {    //tìm bằng id và sửa
                Page.findById(id, function(err, page) {
                    if(err)  return console.error(err); 
                    //title của page sẽ bằng title mới,...

                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                

                    page.save(function(err) {
                        if (err) 
                            return console.error(err);
                        
                        Page.find({}).sort({sorting: 1}).exec(function(err, pages) { //thêm cái này vào để khi bên admin sửa page thì home sẽ tự động sửa
                            if(err) {
                                console.log(err);
                            } else {
                                req.app.locals.pages = pages;
                            }
                        });

                        req.flash('success', 'Page edited successfully!!!');
                        res.redirect('/admin/pages'); 
                    });
                });      
            }
        });
    }

})

//get trang xóa trang 
router.get('/delete-page/:id', isAdmin, function(req, res) {
    Page.findByIdAndRemove(req.params.id, function(err, page) {
        if(err) 
            return console.log(err);

        Page.find({}).sort({sorting: 1}).exec(function(err, pages) { //thêm cái này vào để khi bên admin xóapage thì home sẽ tự động xóa
            if(err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Page deleted successfully!!!');
        res.redirect('/admin/pages/')
    });
});


module.exports = router;