//database cho trang sản phẩm
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ProductSchema = new Schema({
    title: {type: String, required: true},
    slug: {type: String},
    desc: {type: String, required: true},
    category: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: String}, 
    date: {type: Date, default: Date.now}
});


var Product = module.exports = mongoose.model('Product', ProductSchema);