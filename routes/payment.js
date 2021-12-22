var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var Order = require('../models/order');


router.get('/payment', function (req, res) {
    res.render('payment',{
        title: 'One more step',
        cart : req.session.cart
    })
});

router.post('/payment', function (req, res) {

    

    req.checkBody('customer', 'Something went wrong').notEmpty();
    req.checkBody('fullname', 'You must enter your name').notEmpty();
    req.checkBody('email', 'You must enter your name').notEmpty();
    req.checkBody('address', 'You must enter your name').notEmpty();
    req.checkBody('tel', 'You must enter your name').notEmpty();
    
    var customer = req.body.customer;
    var fullname = req.body.fullname;
    var email = req.body.email;
    var address = req.body.address;
    var phone = req.body.tel;
    var city = req.body.city;
    var country = req.body.country;
    var zip = req.body.zipcode;

    var product = req.session.cart;

    var orderP =  Object.assign({}, product);

    var errors = req.validationErrors();

    if (errors) {
        res.render('payment', {
            title: 'Error',
            user: req.session.user,
            errors: errors,
            customer: customer,
            fullname: fullname,
            email: email,
            address: address,
            phone: phone,
            city: city,
            country: country,
            zipcode: zip,
            order: orderP
        });
    } else {
        var order = new Order({
            customer: customer,
            fullname: fullname,
            email: email,
            address: address,
            phone: phone,
            city: city,
            country: country,
            zipcode: zip,
            order: orderP,
        })

        order.save(function(err) {
            if (err) {
                console.error(err);
            } else {
                req.flash('success', 'Order success');
                delete req.session.cart;
                res.redirect('/index');
            }
        })
    }

});

module.exports = router;