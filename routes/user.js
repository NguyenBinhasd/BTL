var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

var User = require('../models/user')


//get register
router.get('/register', function(req, res) {
    res.render('register', {
        title: 'Register',      
    });
});


//post Register
router.post('/register', function(req, res) {
    
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password is not match').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register',   
        });
    } else {
        User.findOne({username: username}, function(err, user) {
            if (err)
                console.log(err);

            if(user) {
                req.flash('danger', 'Username already exists!!!');
                res.redirect('/user/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0,  //1, đã từng là 1//sau khi đăng ký thành công 1 tài khoản admin thì chuyển số 1 thành số 0 ngay tại đây
                });

                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered, Login now!!!');
                                res.redirect('/user/login');
                            }
                        });
                    });
                });
            }
        });
    }

});


//get login
router.get('/login', function(req, res) {
    //nếu người dùng có tồn tại thì chuyển hướng sang trang chủ
    if (res.locals.user) res.redirect('/');

    res.render('login', {
        title: 'Login',      
    });
});

//posst login
router.post('/login', function(req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true,
    })(req, res, next);

});

//get logout
router.get('/logout', function(req, res) {
    
    req.logout();

    req.flash('success', 'You are logged out');
    res.redirect('/user/login');
    
});

module.exports = router;