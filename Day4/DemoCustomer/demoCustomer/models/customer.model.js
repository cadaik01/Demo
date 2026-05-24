const mongoose = require('mongoose');

const customerModel = new mongoose.Schema({
    'email': String,
    'name': String,
    'phone': String,
    'fullname': String,
    'image': String
});

module.exports = mongoose.model('Customer', customerModel);