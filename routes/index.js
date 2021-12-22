var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isUser = auth.isUser;


var Page = require('../models/page')

router.get('/', function(req, res) {


    Page.findOne({slug: 'home'}, function(err, page) {
        if (err) 
            return console.log(err);

        res.render('index', {
            title: page.title,
            content: page.content,
        }); 
    });
});

router.get('/:slug', function(req, res) {

    var slug = req.params.slug;

    Page.findOne({slug: slug}, function(err, page) {
        if (err) 
            return console.log(err);
        if(!page) {  //kiểm tra nếu ko có cái page đấy thì trả về home, page là cái contact us, services,...
            res.redirect('/');
        } else { 
            res.render('index', {
                title: page.title,
                content: page.content,
            }); 
        }
    });
});


module.exports = router;