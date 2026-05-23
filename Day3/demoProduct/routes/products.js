var express = require('express');
var router = express.Router();
const ProductModel = require('../models/product.model');

/* GET home page. */
router.get('/', async (req, res) => {
  const products = await ProductModel.find();
  res.render('product/index', { products });
});//product trong này là thư mục product

//Làm Create
router.get('/create', async(req, res) => {
  return res.render('product/create')
})

router.post('/create', async (req, res) => {
  const prod = req.body;
  await ProductModel.create(prod);
  return res.redirect('/products')
})//products này là routes products (link)

//Làm Update
router.get('/update/:id', async (req, res) => {
  const pid = req.params.id;
  const prod = await ProductModel.findById(pid);
  return res.render('product/update', { prod })
})

router.post('/update/:id', async (req, res) => {
  const pid = req.params.id;
  const prod = req.body;
  await ProductModel.findByIdAndUpdate(pid, prod);
  return res.redirect('/products')
})//products này là routes products (link)

//Làm Delete
router.get('/delete/:id', async (req, res) => {
  const pid = req.params.id;
  await ProductModel.findByIdAndDelete(pid);
  return res.redirect('/products')
})//products này là routes products (link)

//Làm Search - sử dụng dạng query String - chỉ cần có key
router.get('/search', async (req, res) => {
  const keyword = req.query.keyword;
  var products = await ProductModel.find({ 'name': new RegExp(keyword, 'i') });
  //RegExp= regular expression & i = ignore case
  return res.render('product/index', { products });
})

module.exports = router;
