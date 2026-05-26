const mongoose = require ('mongoose');

const AccountSchema = new mongoose.Schema({
    'email': String,
    'pwd': String,
    'phone': String,
    'fullname': String,
})

module.exports = mongoose.model('account', AccountSchema);