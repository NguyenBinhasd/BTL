var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isUser = auth.isUser;

//tao ra de lam phan gio hang
var Product = require('../models/product')


//get add product to cart
router.get('/add/:product', function(req, res) {

    var slug = req.params.product;


    Product.findOne({slug: slug}, function(err, p) {
        if (err) 
            return console.log(err);

        if (typeof req.session.cart == 'undefined') {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,  //qty de dem so luong hang trong gio xem cai loai nay co bao nhieu cai, kieu trung nhau ay
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image,
            }); 
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if(newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image,
                });
            }
        }
        //console.log(req.session.cart);
        req.flash('success', 'Product added into your cart!!!');
        res.redirect('back');
    });
});

//get checkout kiem tra gio hang
router.get('/checkout', function (req, res) {
    
    if(req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart,
        });
    }

});


//get update product in cart
router.get('/update/:product', function (req, res) {
    
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for(var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch(action) {
                case 'add':
                    cart[i].qty++;
                    break;
                case 'remove':
                    cart[i].qty--;
                    if(cart[i].qty < 1) {
                        cart.splice(i, 1);
                    }
                    break;
                case 'clear':
                    cart.splice(i, 1);
                    if (cart.length == 0) delete req.session.cart; //xoa full hang
                    break;
                default:
                    console.log('update request failed');
                    break;
            }
            break;
        }
    }
    req.flash('success', 'Cart updated successfully');
    res.redirect('/cart/checkout');
});
//get clear all cart
router.get('/clear', function (req, res) {
    
        delete req.session.cart;
        req.flash('success', 'Cart Clear successfully');
        res.redirect('/cart/checkout');
});

module.exports = router;