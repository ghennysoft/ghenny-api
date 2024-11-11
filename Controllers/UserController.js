import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import { createError } from "../error.js";


// Search data
export const searchData = async (req, res) => {
    try {
        const userProfile = await UserModel.aggregate([
            {
                $match: {
                $or: [
                    {firstname: {$regex: req.query.q, $options: 'i'}},
                    {lastname: {$regex: req.query.q, $options: 'i'}},
                ],
                },
            },
            {
                $lookup: {
                from: "Profiles",
                localField: "_id",
                foreignField: "userId",
                as: "profile",
                },
            },
            {
                $project: {
                username: 1,
                firstname: 1,
                lastname: 1,
                profile: 1,
                },
            },
        ]);          
        res.status(200).json(userProfile)
    } catch (error) {
        res.status(500).json(error)
    }
}


export const getProfile = async (req, res) => {
    const paramId = req.params.id;  
    try {
        const user = await UserModel.findOne({username: paramId});
        const profile = await ProfileModel.findOne({userId: user._id}).populate("userId", "-password");
        if(profile){
            res.status(200).json(profile)
        }else{
            res.status(404).json("No such profile exist")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


// Complete profile infos after register
export const completeProfile = async (req, res) => {
    const paramId = req.params.id;

    if(paramId) {
        if(!req.body.gender, !req.body.birthday, !req.body.status, !req.body.domain){
            return res.status(400).json("Veillez remplir tous les champs")
        } else {
            try {
                const profile = await ProfileModel.findByIdAndUpdate(paramId, {$set: req.body}).populate("userId", "-password");
                res.status(200).json({"profile": profile})
            } catch (error) {
                res.status(500).json(error)
            }
        }
    } else {
        retur(createError(403, "Access Denied, you can only update your profile!"))
    }
}


// Update Profile
export const updateProfile = async (req, res) => {
    const paramId = req.params.id;
    if(paramId) {
        try {
            const profile = await ProfileModel.findByIdAndUpdate(paramId, {$set: req.body}).populate("userId", "-password");
            res.status(200).json(profile)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        retur(createError(403, "Access Denied, you can only update your profile!"))
    }
}


// Update Profile & Complete perofile infos after register
export const updatePicture = async (req, res) => {
    const paramId = req.params.id;
    if(paramId) {
        try {
            const picture = await ProfileModel.findByIdAndUpdate(paramId, {
                $set: {profilePicture: req.body}
            });
            res.status(200).json({"picture": picture})
        } catch (error) {
            res.status(500).json(error)            
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
