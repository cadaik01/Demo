var express = require('express');
var router = express.Router();
const AccountSchema = require("../models/account.model");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET home page. */
router.post('/login', async (req, res,) => {
    const { email, pwd } = req.body;

    try {
        const account = await AccountSchema.findOne({ email });
        if (!account) {
            return res.status(400).send("Email or Password is Invalid.")
        }
        if (!account.active) {
            return res.status(400).send("Account not activate.")
        }
        const isMatch = await bcrypt.compare(pwd, account.pwd);
        if (!isMatch) {
            return res.status(400).send("Password invalid. Try again");
        }

        //password right - xử lý JWT
        const token = jwt.sign({
            id: account._id
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "12h"
            });
        res.status(200).json({
            message:"Login Successfully.",
            token: token
        })
    } catch (err) {
        console.log(err);
        res.status(500).send({ 'message': "Internal Server Error" });
    }

});

router.post('/register', async(req,res)=>{
    const {email,pwd} = req.body;
    try{
        let account = await AccountSchema.findOne({email})
        if(account){
            return res.status(400).send({"message": "Email is used."})
        }

        const verifyToken = jwt.sign({email},process.env.JWT_SECRET,{expiresIn: "15m"})

        account = new AccountSchema({
            email,
            pwd,
            role: 'User',
            active: false,
            verify_token: verifyToken
        });

        await account.save();
        //nếu dùng model account thì gọi save(), bth dùng create

        //send activation email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const link =`${req.protocol}://${req.get("host")}/api/auth/verify/${verifyToken}`;
        //chạy = react -> trả lại link react chứ k phải link này

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Activation Account',
            html: `<h2>Activation Account</h2><p>Please click link to activate your account: </p><a href=${link}>Click to Activate!</a>`
        });

        res.status(200).send("Register Successfully!");
    }catch(err){
        console.log(err);
        res.status(500).send({ message: "Internal Server Error" });
    }
})


router.get('/verify/:token', async(req,res)=>{
    const token = req.params.token;
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const account = await AccountSchema.findOne({email: decoded.email});

        if(!account){
            return res.status(400).send("Token not valid.");
        }
        if(account.active){
            return res.status(400).send("Already Activated!");
        }

        account.active = true;
        account.verify_token = null;
        await account.save();
        res.status(200).send("Account activated successfully!");
    }catch(err){
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;