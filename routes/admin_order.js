var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var Order = require('../models/order');

router.get('/',isAdmin, function (req, res) {
    Order.find(function (err, order) {
        if (err) return console.error(err);

        res.render('admin/order', {
            order: order,
        });
    });
});

router.get('/:id',isAdmin, function (req, res) {
    
    Order.findById(req.params.id, function (err,order) {
        if(err) 
            return console.error(err);
        
        res.render('admin/check-detail-order',{
            order: order,
        });
    })

});

module.exports = router;