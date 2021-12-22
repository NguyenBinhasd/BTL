var express = require('express');
var router = express.Router();

var Product = require('../models/product');

router.get('/', (req, res) => {

    if(req.query.search) {

        const key = req.query.search;

        const regex =  new RegExp(escapeRegex(req.query.search), 'gi');

        Product.find({title: regex},function(err, products) {
            if (err) {
                 console.log(err);
            } else {
                var noProducts;
                if(products.length < 1) {
                    noProducts = "Opp! We dont have product what you are looking for"
                }
                res.render('search', {
                    title: 'Search',
                    products: products,
                    key: key,
                    noProducts: noProducts
                }); 
            }
        });
    } else {
        var page = parseInt(req.query.page) || 1;
        var perPage = 12; //perpage la kieu moi page cos ? san pham

        var prevPage = parseInt(1); 
        var nextPage = parseInt(1);

        var start = (page - 1) * perPage; 
        var end = page * perPage;
        Product.find(function(err, products) {

            const key = req.query.search;
            if (err) 
                return console.log(err);
    
            var noProducts;
            if(products.length < 1) {
                noProducts = "Opp! We dont have product what you are looking for"
            }
            res.render('all-products', {
                title: 'All products',
                products: products.slice(start,end),
                page: page,
                nextPage: nextPage,
                prevPage: prevPage
            }); 
        });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;