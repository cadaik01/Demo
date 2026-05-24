var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const CustomerModel = require('../models/customer.model');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, `img-${Date.now()}${path.extname(file.originalname)}`)
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* GET home page. */
router.get('/', async (req, res) => {
    const customers = await CustomerModel.find();
    res.render('customer/index', { customers });
});

router.get('/create', (req, res) => {
    return res.render('customer/create');
});

//khai báo middleware upload để xử lý file upload, sau đó lưu thông tin khách hàng vào database
//khai báo middleware ở đây để chỉ áp dụng cho route này, nếu khai báo ở app.js thì sẽ áp dụng cho tất cả route
router.post('/create', upload.single('image'), async (req, res) => {
    let customer = req.body;
    const img = req.file ? req.file.filename : '';
    customer['image'] = img;

    const custModel = new CustomerModel({
        email: customer.email,
        phone: customer.phone,
        fullname: customer.fullName,
        image: customer.image
    });
    await custModel.save();

    return res.redirect('/customers');
});


//update customer
router.get('/edit/:id', async (req, res) => {
    const customer = await CustomerModel.findById(req.params.id);
    return res.render('customer/edit', { customer });
});

//handle edit submit form
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    let customer = req.body;
    const updateData= {
        email: customer.email,
        phone: customer.phone,
        fullname: customer.fullName,
    };
    if(req.file){
        updateData.image = req.file.filename;
    }

    await CustomerModel.findByIdAndUpdate(req.params.id, updateData);
    return res.redirect('/customers');
})

//delete customer
router.post('/delete/:id', async (req, res) =>{
    await CustomerModel.findByIdAndDelete(req.params.id);
    return res.redirect('/customers');
});

//search customer
router.get('/search', async (req,res) => {
    const keyword = req.query.keyword;
    var customers = await CustomerModel.find({'fullname': new RegExp(keyword,'i')
    });
    return res.render('customer/index', {customers})
})
module.exports = router;
