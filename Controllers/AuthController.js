import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'


export const registerUser = async (req, res, next) => {
    const {username, firstname, lastname, contact, my_password} = req.body;
    
    // if(!firstname, !lastname, !contact, !my_password){
    //     res.status(400).json("Veillez remplir tous les champs")
    // } else {
        try {
            const salt = await bcrypt.genSalt(10)
            const hashedPass = await bcrypt.hash(my_password, salt)
            const newUser = new UserModel({username, firstname, lastname, contact, password:hashedPass});
            
            const user = await newUser.save();
            const token = jwt.sign({id:user._id}, process.env.JWT_KEY, {expiresIn: "1h"})
            const {password, ...others} = user._doc
            res.cookie("access_token", token, {
                httpOnly: true,
            }).status(200).json(others)
    
        } catch (err) {
            next(err)
        }
    // }

}


export const loginUser = async (req, res, next) => {
    const {phone, password} = req.body;
    
    try {

        if(!phone || !password){
            return res.status(400).json("Veillez remplir tous les champs")
        } else {
            const user = await UserModel.findOne({phone:phone})
            if(user) {
                const validity = await bcrypt.compare(password, user.password)
                
                if(!validity) {
                    res.status(400).json("Mot de passe incorrect")
                } else {
                    const token = jwt.sign({id:user._id}, process.env.JWT_KEY, {expiresIn: "1h"})
    
                    const {password, ...others} = user._doc
    
                    res.cookie("access_token", token, {
                        expires: new Date(Date.now() + 25892000000),
                        httpOnly: true,
                    }).status(200).json(others)
                }
            } else {
                res.status(400).json("Données incorrects, réessayez!")
            }
        }
        
        

    } catch (err) {
        next(err)
    }

}


// Complete user infos
export const competeUser = async (req, res) => {
    const paramId = req.params.id;
    
    if(paramId) {
        try { 
            const user = await UserModel.findByIdAndUpdate(paramId, {$set: req.body}, {new:true});
            res.status(201).json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        retur(createError(403, "Access Denied, you can only update your profile!"))
    }
}