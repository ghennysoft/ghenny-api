import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'

export const registerUser = async (req, res) => {
    
    try {
        if(!req.body.username){
            res.status(400).json("Veillez remplir le mot de passe")
        } else {
            const salt = await bcrypt.genSalt(10)
            const hashedPass = await bcrypt.hash(req.body.password, salt)
            const newUser = new UserModel({
                username: req.body.username, 
                firstname: req.body.firstname, 
                lastname: req.bodylastname, 
                contact: req.body.contact, 
                password: hashedPass,
            });

            console.log(req.body, hashedPass);
            
            const user = await newUser.save();
            const token = jwt.sign({id:user._id}, process.env.JWT_KEY, {expiresIn: "1h"})
            const {password, ...others} = user._doc
            res.cookie("access_token", token, {
                httpOnly: true,
            }).status(200).json(others)
        } 
    }
    catch (err) {
        res.status(500).json(err)
        console.log(err);
    }
}


export const loginUser = async (req, res, next) => {
    const {contact, password} = req.body;
    console.log(req.body);
    console.log(contact, password);
    
    try {

        if(!contact || !password){
            return res.status(400).json("Veillez remplir tous les champs")
        } else {
            const user = await UserModel.findOne({contact:{phone: contact}})
            // const user2 = await UserModel.findOne({contact:{phone_code: contact}})
            // const user3 = await UserModel.findOne({contact:{phone_code_2: contact}})
            // const user = user1 || user2 || user3
            console.log('user :', user);
            
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
export const completeUser = async (req, res) => {
    const paramId = req.params.id;
    
    if(paramId) {
        if(!req.body.gender, !req.body.birthday, !req.body.status, !req.body.domain){
            return res.status(400).json("Veillez remplir tous les champs")
        } else {
            try { 
                const user = await UserModel.findByIdAndUpdate(paramId, {$set: req.body}, {new:true});
                res.status(201).json(user)
            } catch (error) {
                res.status(500).json(error)
            }
        }
    } else {
        retur(createError(403, "Access Denied, you can only update your profile!"))
    }
}