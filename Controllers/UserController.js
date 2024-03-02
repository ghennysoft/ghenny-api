import UserModel from "../Models/userModel.js";
import { createError } from "../error.js";


// Get a User
export const getUser = async (req, res, next) => {
    const paramId = req.params.id;

    try {
        const user = await UserModel.findById(paramId);
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


// Update User
export const updateUser = async (req, res, next) => {
    const paramId = req.params.id;
    const currentUserId = req.user.id;

    if(paramId === currentUserId) {
        try { 
            const user = await UserModel.findByIdAndUpdate(paramId, {$set: req.body}, {new:true});
            res.status(201).json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        return next(createError(403, "Access Denied, you can only update your profile!"))
    }
}


// Delete User
export const deleteUser = async (req, res, next) => {
    const paramId = req.params.id;
    const currentUserId = req.user.id;

    if(paramId === currentUserId) {
        try { 
            const user = await UserModel.findByIdAndDelete(paramId);
            res.status(201).json("User deleted successfully")
        } catch (err) {
            next(err);
        }
    } else {
        return next(createError(403, "Access Denied, you can only delete your profile!"))
    }
}
