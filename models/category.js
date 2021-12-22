//database cho danh mục sản phẩm
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema cho sản phẩm
var CategorySchema = new Schema({

    title: {type: String, required: true},
    slug: {type: String},

});

var Category = module.exports = mongoose.model('Category', CategorySchema);