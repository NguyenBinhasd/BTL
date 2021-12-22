var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var ExpressValidator = require('express-validator');
var fileUpload = require("express-fileUpload");
var passport = require('passport');


mongoose.connect(config.database);
var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('Connect successfully!!!');
    });

    //init app
var app = express();

    //view engie setp
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

    //set public folder
app.use(express.static(path.join(__dirname, 'public')));

    //set global error
app.locals.errors = null;

    //get page model,bắt đầu làm phần trang chủ cho web sau khi làm xong admin
var Page = require('./models/page');

    //get all page trong admin/page cho header.ejs, sau khi hoàn toàn chỉnh xong admin, tạo front menu display
Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages; //tạo cái pages thành local để có thể xài ở bất kì đâu, hiện tại đang dùng để xài trong header.ejs
    }
});

    //get category trong model
var Category = require('./models/category');

    //get all category trong admin/category cho header.ejs, sau khi hoàn toàn chỉnh xong admin, tạo front menu display
Category.find(function(err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories; //tạo cái categories thành local để có thể xài ở bất kì đâu, hiện tại đang dùng để xài trong index.ejs
    }
});



    //express fileupload 
app.use(fileUpload());

    //body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



    //express-session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
 //   cookie: { secure: true }
}));



    //express validator
app.use(ExpressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value,
        };
    },
    customValidators: {
        isImage: function(value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                    break;
                case '.jpeg':
                    return '.jpeg';
                    break;
                case '.png':
                    return '.png';
                    break;
                case '':
                    return '.jpg';
                    break; 
                default:
                    return false;   
            }
        }
    }
}));


    //express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


//passport middleware, passport setup
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//get full de tao gio hang thanh local voi user
app.get('*', function (req, res, next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

    //set Router trong thư mục routes
var pages = require('./routes/index');
var products = require('./routes/products');
var cart = require('./routes/cart');
var user = require('./routes/user');
var adminPages = require('./routes/admin_page');
var adminCategories = require('./routes/admin_categories');
var adminOrder = require('./routes/admin_order');
var adminProducts = require('./routes/admin_products');
var search = require('./routes/search');
var payment = require('./routes/payment');


app.use('/result', search)
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/admin/order', adminOrder);
app.use('/products', products);  //lay urrl san pham
app.use('/cart/checkout', payment);
app.use('/cart', cart);   //lay url gio hang
app.use('/user', user); //lay url den trang user
app.use('/', pages);



    //start server
var port = 3000;
app.listen(port, function () {
    console.log('As you wish, my Lord, your server listening on port ' + port);
})