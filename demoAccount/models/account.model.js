const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');

const AccountSchema = new mongoose.Schema({
    'email': String,
    'pwd': String,
    'phone': String,
    'role' : String,
    'fullname': String,
    'active': Boolean,
    'verify_token': String
})

AccountSchema.pre('save',async function(){
    if(!this.isModified('pwd')){
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.pwd = await bcrypt.hash(this.pwd, salt);
})

module.exports = mongoose.model('account', AccountSchema);