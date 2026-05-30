var express = require('express');
var router = express.Router();
const AccountSchema = require("../models/account.model");
const jwt = require('jsonwebtoken');

//viết middleware check account
const authToken = (req,res,next) =>{
  const authHeader = req.header("Authorization");
  if(!authHeader){
    return res.status(400).send("Access denied!");
  }

  //authHeader: bearer token_string --> parse thành 2 phần tử -> trả về phần tử index 1
  const token = authHeader.split(" ")[1];
  if(!token){
    return res.status(400).send("Access denied!");
  }

  console.log(`token:${token}`);

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.account = decoded;
    next();
  }catch(err){
    return res.status(400).send("Invalid token!");
  }
}

/* GET home page. */
router.get('/', authToken, async (req, res) => {
  var accounts = await AccountSchema.find();
  return res.status(200).json(accounts);
});

//Create
router.post('/', async (req, res) => {
  const account = req.body;
  account['active'] = false;
  const result = await AccountSchema.create(account);
  return res.status(200).json(result);
});

//Update
router.put('/:id', async (req, res) => {
  const accID = req.params.id;
  const account = req.body;

  await AccountSchema.findByIdAndUpdate(accID, {
    $set: {
      email: account.email,
      phone: account.phone,
      fullname: account.fullname,
      role: account.role,
      active: account.active
    }
  });
  return res.status(200).json({ message: 'Updated successfully' });
});

//Delete
router.delete('/:id', async (req, res) => {
  const accID = req.params.id;
  
  await AccountSchema.findByIdAndDelete(accID);
  return res.status(200).json({ message: 'Deleted successfully' });
});

//Search
router.get('/:id', async (req, res) => {
  var accID = req.params.id;
  var account = await AccountSchema.findById(accID);
  return res.status(200).json(account);
});

module.exports = router;
