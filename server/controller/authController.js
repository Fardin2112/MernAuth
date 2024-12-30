import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModels';

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
       const user = new userModel({}) 
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}