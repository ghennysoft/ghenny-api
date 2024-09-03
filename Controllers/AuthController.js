import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'


export const registerUser = async (req, res, next) => {
    const {username, firstname, lastname, email, phone, password} = req.body;
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(password, salt)

    if(!firstname, !lastname, !email, !phone, !password){
        res.status(400).json("Remplissez tous les champs")
    }
    
    try {
        const newUser = new UserModel({username, firstname, lastname, phone, password:hashedPass});
        
        const user = await newUser.save();
        const token = jwt.sign({id:user._id}, process.env.JWT_KEY, {expiresIn: "1h"})
        const {password, ...others} = user._doc
        res.cookie("access_token", token, {
            httpOnly: true,
        }).status(200).json(others)

    } catch (err) {
        next(err)
    }

}

export const loginUser = async (req, res, next) => {
    const {email, password} = req.body;
    
    try {

        if(!email, !password){
            return res.status(400).json("Veillez remplir tous les champs")
        }
        const user = await UserModel.findOne({email:email}) 
        
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

    } catch (err) {
        next(err)
    }

}