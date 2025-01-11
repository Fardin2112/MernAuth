import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModels.js';
import transporter from '../config/nodemailer.js';

 // register
 export const register = async (req,res) => {

    const {name, email, password} = req.body;
    
    if (!name || !email || ! password){
        return res.json({success: false, message:'Missing Details'})
    }

    try { 
        // if user exit 
        const existingUser = await userModel.findOne({email})
        if (existingUser){
            return res.json({success: false , message: 'User already exist'})
        }
       const hashedPassword = await bcrypt.hash(password, 10);
       console.log(hashedPassword)
       const user = new userModel({name, email, password:hashedPassword});
       await user.save(); 

       const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn :'7d'})
       console.log(user,token);
       

                 // 'name', 'responce'
       res.cookie('token',token, {
           httpOnly:true,
           secure : process.env.NODE_ENV === 'production',
           sameSite : process.env.NODE_ENV === 'production' ?
           'node' : 'strict',
           maxAge : 7 * 24 * 60 * 60 * 1000
        })

        // send welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to : email,
            subject : 'Welcome to Healthcare',
            text : `Welcome to Healthcare website. Your account has been created with email id ${email}`
        }
        console.log("mailopitons",mailOptions);

        await transporter.sendMail(mailOptions);
        return res.json({success:true})
       
    } catch (error) {
        res.json({success:false, message: error.message})
    }
 }

 // login
 export const login = async (req,res) => {

    const {email, password} = req.body;

    if (!email || !password) {
        return res.json({success:false, message : 'Email and password are required'})
    }

    try {
        const user = await userModel.findOne({email})

        if (!user){
            return res.json({success:false,message:'Invalid Email'})
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if (!isMatch) {
            return res.json({success:false, message:'Invalid password'})
        }

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn :'7d'})
        res.cookie('token',token, {
            httpOnly:true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ?
            'none' : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success:true})


    } catch (error) {
        res.json({success:false, message: error.message})
    }
 }

 // logout
  export const logOut = async (req,res) => {

    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ?
            'none' : 'strict',
        })

        return res.json({success:true, message:'Logged Out'})
    } catch (error) {
        res.json({success:false, message: error.message})
    }
  }

  // Send verification OTP to the user's Email
export const sendVerifyOtp = async (req,res) => {
     try {
        const {userId} = req.body;
        
        const user = await userModel.findById(userId)

        if (user.isAccountVerified){
            res.json({success:false, message:'Account Already verified'})
        }

        const otp = String(Math.floor(100000 + Math.random()*900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Data.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOption = {
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject : 'Account Verification OTP',
            text : `Your Otp is ${otp}.Verify your account using this OTP`
        }
        await transporter.sendMail(mailOption);
        res.json({success:true, message:'Verication OTP sent on Email'})

     } catch (error) {
        res.json({success:false, message: error.message})
     } 
}

export const verifyEmail = async (req,res) => {

    const {userId, otp} = req.body;

    if (!userId || !otp) {
        return res.json({success:false, message:'Missing Details'})
    }
    try {
        const user = await userModel.findById(userId);

        if (!user){
            return res.json({success:false, message:'User not found'})
        }
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({success:false, message:'Invalid OTP'})
        }
        if (user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false , message: 'OTP Experied'})
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success:true , message:'Email verified successfully'})
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}