import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'


export const registerUser = async (req, res, next) => {
    const {firstname, postname, lastname, email, phone, password} = req.body;
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(password, salt)
    
    try {
        const newUser = new UserModel({firstname, postname, lastname, email, phone, password:hashedPass});
        const existingEmail = await UserModel.findOne({email})
        const existingUsername = await UserModel.findOne({username: req.body.username})
        if(existingEmail) {
            res.status(400).json("Email already exist")
        }
        else if(existingUsername) {
            res.status(400).json("Username already exist")
        }
        else {
            const user = await newUser.save();
            const token = jwt.sign({id:user._id}, process.env.JWT_KEY, {expiresIn: "1h"})
            const {password, ...others} = user._doc
            res.cookie("access_token", token, {
                httpOnly: true,
            }).status(200).json(others)
        }

        
            
    } catch (err) {
        next(err)
    }

}

export const loginUser = async (req, res, next) => {
    const {email, password} = req.body;
    
    try {
        const user = await UserModel.findOne({email:email}) 
        
        if(user) {
            const validity = await bcrypt.compare(password, user.password)
            
            if(!validity) {
                res.status(400).json("Wrong password")
            } else {
                const token = jwt.sign({id:user._id}, process.env.JWT_KEY, {expiresIn: "1h"})

                const {password, ...others} = user._doc

                res.cookie("access_token", token, {
                    httpOnly: true,
                }).status(200).json(others)
            }

        } else {
            res.status(400).json({message: "User doesn't exist"})
        }

    } catch (err) {
        next(err)
    }

}