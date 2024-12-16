import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import { createError } from "../error.js";
import PostModel from "../Models/postModel.js";
import birthdayWishModel from "../Models/birthdayWishModel.js";
import QuestionModel from "../Models/questionModel.js";


// Search data
export const searchData = async (req, res) => {
    try {
        // Search user
        const profiles = await UserModel.find({
            $or: [
                {firstname: {$regex: req.query.q, $options: 'i'}},
                {lastname: {$regex: req.query.q, $options: 'i'}},
            ],
        })
        .select('username firstname lastname')
        .populate('profileId', 'profilePicture')

        // Search post
        const posts = await PostModel.find({content: {$regex: req.query.q, $options: 'i'}})

        // Search question
        const questions = await QuestionModel.find({content: {$regex: req.query.q, $options: 'i'}})

        res.status(200).json({profiles, posts, questions})
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
    const {profileId, userId} = req.params;

    if(profileId) {
        if(!req.body.gender, !req.body.birthday, !req.body.status){
            return res.status(400).json("Veillez remplir tous les champs")
        } else {
            try {
                const user = await UserModel.findByIdAndUpdate(userId, {$set: {profileId: profileId}})
                const profile = await ProfileModel.findByIdAndUpdate(profileId, {$set: req.body}).populate("userId", "-password");
                res.status(200).json({"profile": profile, "user": user})
            } catch (error) {
                res.status(500).json(error)
            }
        }
    } else {
        retur(createError(403, "Access Denied, you can only update your profile!"))
    }
}

// Suggest studyAt infos in register
export const suggestStudyAt = async (req, res) => {
    try {
        const schools = await ProfileModel.distinct('school')
        const options = await ProfileModel.distinct('option')
        const universities = await ProfileModel.distinct('university')
        const filieres = await ProfileModel.distinct('filiere')

        res.status(200).json({schools, options, universities, filieres})
    } catch (error) {
        res.status(500).json(error)
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

export const followUnfollowUser = async (req, res) => {
    const {currentUserId, foreignUserId} = req.body;    
    try {
        const currentProfile = await ProfileModel.findById(currentUserId)
        const foreignProfile = await ProfileModel.findById(foreignUserId)
        if(!currentProfile.followings.includes(foreignUserId)) {
            await currentProfile.updateOne({$push: {followings:foreignUserId}});
            await foreignProfile.updateOne({$push: {followers:currentUserId}});
            res.status(200).json('Profile pinned')
        } else {
            await currentProfile.updateOne({$pull: {followings:foreignUserId}});
            await foreignProfile.updateOne({$pull: {followers:currentUserId}});
            res.status(200).json('Profile unpinned!')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const postBirthdayWish = async (req, res) => {
    try {
        const findWish = await birthdayWishModel.findOne({
            $and: [
                {user: req.body.mainUserId},
                {year: req.body.year},
            ],
        })

        if(findWish){
            await findWish.updateOne({$push: {posts: req.body.post}});
            res. status(200).json(findWish)
        } else {
            const addWish = new birthdayWishModel({
                user: req.body.mainUserId,
                year: req.body.year,
                posts: [req.body.post],
            })
            await addWish.save()
            res. status(200).json(addWish)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getBirthdayWishes = async (req, res) => {    
    try {
        const wishes = await birthdayWishModel.findOne({
            $and: [
                {user: req.params.userId},
                {year: req.params.year},
            ],
        })
        res.status(200).json(wishes)
    } catch (error) {
        res.status(500).json(error)
        console.log(error);
    }
}

export const getUserData = async (req, res) => {
    const id = req.params.id;
    try {
        const profile = await ProfileModel.findById(id)

        const posts = await PostModel.find({author: profile._id}).sort({createdAt: -1})
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userId profilePicture status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })

        const questions = await QuestionModel.find({author: profile._id}).sort({createdAt: -1})
        .populate({
            path: 'author',
            select: 'userId profilePicture -_id',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'answers',
            populate: {
                path: 'author',
                select: 'userId profilePicture studyAt domain',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'subjects',
            select: '_id name',
        })

        res.status(200).json({posts, questions})
    } catch (error) {
        res.status(500).json(error)
    }
}