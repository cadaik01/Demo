var express = require('express');
var router = express.Router();
const AccountSchema = require("../models/account.model")

/* GET home page. */
router.get('/', async (req, res,) => {
  res.render('auth/login');
});

router.post('/login', async (req, res,) => {
  const { email, pwd } = req.body;
  const accounts = await AccountSchema.findOne({ email: email });//lấy phần tử đầu tiên trong list nếu có email trùng
  if (accounts != null) { //kiểm tra đúng email
    if (accounts.pwd === pwd) { //kiểm tra đúng password
      return res.redirect('/account'); //nếu đúng chuyển về trang account
    }
  }
  return res.render('auth/login', { msg: 'Invalid email or password' }); //néu sai thông báo lỗi
});

module.exports = router;
