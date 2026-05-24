var express = require('express');
var router = express.Router();
var Expense = require('../models/Expense');

//GET /expense - hiểm thị danh sách tất cả chi tiêu
router.get('/', async function (req, res, next) {
    try {
        //lấy tất cả document, sắp xếp theo date mới nhất (-1 = giarm dần)
        var expenses = await Expense.find({}).sort({ date: -1 });
        res.render('expenses/list', { expenses: expenses });
    } catch (err) {
        next(err); // chuyển lỗi sang error handler của express
    }
});

//GET /expense/new - hiển thị form thêm mới (không cần db)
router.get('/new', function (req, res, next) {
    res.render('expenses/new');
});

//POST /expense - nhận dữ liệu form, lưu vào DB
router.post('/', async function (req, res, next) {
    try {
        //req.body chưa dữ liệu từ form
        var expense = new Expense({
            title: req.body.title,
            amount: req.body.amount,
            category: req.body.category,
            date: req.body.date
        });
        await expense.save();// lưu vào mongoDB
        res.redirect('/expenses');//sau khi lưu trả về dah sáchg
    } catch (err) {
        next(err);
    }
});

//POST /expense/:id/delete - xóa chi tiêu
router.post('/:id/delete', async function (req, res, next) {
    try {
        //req.params.id lấy :id từ url
        await Expense.findByIdAndDelete(req.params.id);
        res.redirect('/expenses');
    } catch (err) {
        next(err);
    }
});

module.exports = router;