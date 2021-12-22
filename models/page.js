//database CRUD cho trang admin

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema cho trang
var PageSchema =  new Schema({

    title: {type: String, required: true},
    slug: {type: String},
    content: {type: String, required: true},
    sorting: {type: Number},

});

var Page = module.exports = mongoose.model('Page', PageSchema);