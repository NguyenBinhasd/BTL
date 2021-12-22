//database CRUD cho trang paymet

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema cho trang
var OrderSchema =  new Schema({

    customer: {type: String, required: true},
    fullname: {type: String, required: true},
    email: {type: String, required: true},
    address: {type: String, required: true},
    city: {type: String},
    country: {type: String},
    zipcode: {type: String},
    phone: {type: String, required: true},
    order: {type: Object, required: true},
});

var Order = module.exports = mongoose.model('Order', OrderSchema);