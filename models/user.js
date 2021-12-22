//database cho trang login

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Schema cho user
var UserSchema =  new Schema({

    name: {type: String, required: true},
    email: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    admin: {type: Number}

});

var User = module.exports = mongoose.model('User', UserSchema);