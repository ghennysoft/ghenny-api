import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import cloudinary from "../cloudinary.js";
import { createError } from "../error.js";


// Search users
export const searchUsers = async (req, res) => {
    try {
        const users = await UserModel.find({firstname: {$regex: req.query.firstname}}).limit(10).select("firstname lastname profilPicture")
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json(error)
    }
}


export const getUser = async (req, res) => {
    const paramId = req.params.id;
    try {
        const user = await UserModel.findOne({username: paramId});
        if(user){
            const {password, ...other} = user._doc
            res.status(200).json(other)
        }else{
            res.status(404).json("No such user exist")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}


// Update Profile & Complete perofile infos after register
export const updateProfile = async (req, res) => {
    const paramId = req.params.id;
    console.log(paramId);
    if(paramId) {
        if(!req.body.gender, !req.body.birthday, !req.body.status, !req.body.domain){
            return res.status(400).json("Veillez remplir tous les champs")
        } else {
            try {
                const profile = await ProfileModel.findByIdAndUpdate(paramId, {$set: req.body}, {new:true});
                res.status(201).json(profile)
            } catch (error) {
                res.status(500).json(error)
            }
        }
    } else {
        retur(createError(403, "Access Denied, you can only update your profile!"))
    }
}


// Delete User
export const deleteUser = async (req, res) => {
    const paramId = req.params.id;
    const currentUserId = req.user.id;

    if(paramId === currentUserId) {
        try { 
            const user = await UserModel.findByIdAndDelete(paramId);
            res.status(201).json("User deleted successfully")
        } catch (err) {
    (err);
        }
    } else {
        retur(createError(403, "Access Denied, you can only delete your profile!"))
    }
}
