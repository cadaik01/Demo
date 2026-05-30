var express = require('express');
const AccountSchema = require('../models/account.model');
const { body, validationResult } = require('express-validator');
var router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
    const accounts = await AccountSchema.find();
    res.render('account/index', { accounts });
});

//Create
router.get('/create', async (req, res) => {
    return res.render('account/create');
})

router.post('/create',
    [
        body('email')
            .notEmpty().withMessage("Please input email.")
            .isEmail().withMessage("Email not valid"),
        body('pwd')
            .trim()
            .isLength({ min: 6 }).withMessage('Please input password at least 6 chars')
            .custom((value, { req })=>value ===req.body.confirm)
            .withMessage('Password must as same as confirm password.'),
            body('phone')
            .matches(/^[0-9]+$/).withMessage("Phone must contain only digits")
            .isLength({ min: 10 }).withMessage("Must at least 10 chars"),
            body('fullname')
            .trim()
            .notEmpty().withMessage('Please input fullname.')
    ], async (req, res) => {
        //validation
        const errors = validationResult(req); //catch lỗi hứng vào biến
        if (!errors.isEmpty()) {
            console.log(errors.errors);//hiển thị lỗi
            return res.render('account/create', { errors: errors.errors })
        }

        const accounts = req.body;
        await AccountSchema.create(accounts);
        return res.redirect('/account');
    })

    //Delete
router.get('/delete/:id', async (req, res) => {
    const cid = req.params.id;
    await AccountSchema.findByIdAndDelete(cid);
    return res.redirect('/account');
})

module.exports = router;
