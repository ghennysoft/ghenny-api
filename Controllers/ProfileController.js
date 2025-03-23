import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import { createError } from "../error.js";
import PostModel from "../Models/postModel.js";
import birthdayWishModel from "../Models/birthdayWishModel.js";
import QuestionModel from "../Models/questionModel.js";
import AnswerModel from "../Models/answerModel.js";
import birthdayWishPostModel from "../Models/birthdayWishPostModel.js";
import PinCategoryModel from "../Models/pinCategoryModel.js";
import dotenv from 'dotenv';

dotenv.config()

// Search data
export const searchData = async (req, res) => {
    const searchTerm = req.query.q || ''
    
    try {
        // Search user
        const searchParts = searchTerm.split(' ').map(part => part.trim()).filter(part => part.length > 0);

        let profiles = [];

        if (searchParts.length === 1) {
            // Recherche par prénom ou nom seul
            profiles = await UserModel.find({
                $or: [
                    { firstname: { $regex: searchParts[0], $options: 'i' } },
                    { lastname: { $regex: searchParts[0], $options: 'i' } }
                ]
            })
            .select('username firstname lastname')
            .populate('profileId', 'profilePicture')
        } else if (searchParts.length === 2) {
            // Recherche avec prénom + nom ou nom + prénom
            const [part1, part2] = searchParts;
      
            profiles = await UserModel.find({
              $or: [
                {
                  firstname: { $regex: part1, $options: 'i' },
                  lastname: { $regex: part2, $options: 'i' }
                },
                {
                  firstname: { $regex: part2, $options: 'i' },
                  lastname: { $regex: part1, $options: 'i' }
                }
              ]
            })
            .select('username firstname lastname')
            .populate('profileId', 'profilePicture')
        }
        

        // Search post
        const posts = await PostModel.find({content: {$regex: searchTerm, $options: 'i'}})

        // Search question
        const questions = await QuestionModel.find({content: {$regex: searchTerm, $options: 'i'}})

        res.status(200).json({profiles, posts, questions})
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getProfile = async (req, res) => {
    const paramId = req.params.id;
     
    try {
        const user = await UserModel.findOne({username: paramId});
        
        const profile = await ProfileModel.findOne({userId: user._id})
        .populate("userId", "-password")
        .populate({
            path: 'pins',
            select: 'userId profilePicture status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })

        if(profile){
            res.status(200).json(profile)
        }else{
            res.status(404).json("No such profile exist")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getPins = async (req, res) => {
    const paramId = req.params.id;  
    try {
        const profile = await ProfileModel.findById(paramId)
        const pins = profile.pins        
        let pinProfile = {};
        let pinsData = [];
        if(pins.length!==0){
            for(let i=0; i<pins.length; i++){
                pinProfile = await ProfileModel.findById(pins[i])
                .select('userId profilePicture status school option university filiere profession entreprise')
                .populate({
                    path: 'userId',
                    select: 'username firstname lastname',
                })                
                pinsData.push(pinProfile);
            }
            res.status(200).json(pinsData)
        }else{
            res.status(200).json(pinsData)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Complete profile infos after register
export const completeProfile = async (req, res) => {
    const {gender, birthday, status, school, option, university, filiere, entreprise, profession} = req.body;
    const {profileId, userId} = req.params;
    let pictureFile = {};
    if(req.file) {
        pictureFile = {
            key: req.file.key,
            location: req.file.location,
            url: process.env.AWS_CLOUDFRONT_DOMAIN+req.file.key,
        }        
    }

    if(profileId) {
        if(!gender, !birthday, !status){
            return res.status(400).json("Veillez remplir tous les champs")
        } else {
            try {
                const user = await UserModel.findByIdAndUpdate(userId, {$set: {profileId: profileId}})
                const profile = await ProfileModel.findByIdAndUpdate(
                    profileId,
                    {$set: {
                        gender,
                        birthday,
                        status,
                        school,
                        option,
                        university,
                        filiere,
                        entreprise,
                        profession,
                        profilePicture: pictureFile,
                    }}
                )
                .populate("userId", "-password");

                console.log({profile, user})
                res.status(200).json({"profile": profile, "user": user})
            } catch (error) {
                // console.log(error)
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
        const professions = await ProfileModel.distinct('profession')

        res.status(200).json({schools, options, universities, filieres, professions})
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

// Update Profile & Complete profile infos after register
export const updatePicture = async (req, res) => {
    const paramId = req.params.id;
    let pictureFile = {};
    if(req.file) {
        pictureFile = {
            key: req.file.key,
            location: req.file.location,
            url: process.env.AWS_CLOUDFRONT_DOMAIN+req.file.key,
        }        
    }
    if(paramId) {
        try {
            const picture = await ProfileModel.findByIdAndUpdate(paramId, {
                $set: {profilePicture: pictureFile}
            });
            res.status(200).json({"picture": picture})
        } catch (error) {
            res.status(500).json(error)            
        }
    } else {
        retur(createError(403, "Access Denied, you can only update your profile!"))
    }
}

// Update Profile & Complete profile infos after register
export const updateCoverPicture = async (req, res) => {
    const paramId = req.params.id;
    let pictureFile = {};
    if(req.file) {
        pictureFile = {
            key: req.file.key,
            location: req.file.location,
            url: process.env.AWS_CLOUDFRONT_DOMAIN+req.file.key,
        }        
    }
    if(paramId) {
        try {
            const picture = await ProfileModel.findByIdAndUpdate(paramId, {
                $set: {coverPicture: pictureFile}
            });
            res.status(200).json({"coverPicture": picture})
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

export const postBirthdayWish = async (req, res) => {
    try {
        const findWish = await birthdayWishModel.findOne({
            $and: [
                {user: req.body.mainUserId},
                {year: req.body.year},
            ],
        })

        if(findWish){
            const addWishPost = new birthdayWishPostModel({birthdayId: findWish._id, author: req.body.author, video: req.body.video})
            const birthday= await findWish.updateOne({$push: {posts: addWishPost._id}});
            await addWishPost.save()
            res. status(200).json({birthday, addWishPost})
        } else {
            const addWish = new birthdayWishModel({
                user: req.body.mainUserId,
                year: req.body.year,
            })
            const addWishPost = new birthdayWishPostModel({
                birthdayId: addWish._id, 
                author: req.body.author, 
                video: req.body.video
            })
            const birthday= await addWish.updateOne({$push: {posts: addWishPost._id}});
            await addWish.save()
            await addWishPost.save()
            res. status(200).json({birthday, addWishPost})
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getBirthdayWishes = async (req, res) => {    
    try {
        const wish = await birthdayWishModel.findOne({
            $and: [
                {user: req.params.userId},
                {year: req.params.year},
            ],
        })
        
        let wishes=null;
        if(wish){
            wishes = await birthdayWishPostModel.find({birthdayId: wish._id})
            .populate({
                path: 'author',
                select: 'userId profilePicture',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            })
        }
        res.status(200).json(wishes)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
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
                select: 'userId profilePicture birthday status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture birthday status school option university filiere profession entreprise',
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

        const answers = await AnswerModel.find({author: profile._id}).sort({createdAt: -1})
        .populate({
            path: 'author',
            select: 'userId profilePicture -_id',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'questionId',
            select: 'content likes dislikes viewers'
        })

        res.status(200).json({posts, questions, answers})
    } catch (error) {
        res.status(500).json(error)
    }
}

// Users to pin suggestions
export const PinningUser = async (req, res) => {
    const {currentUserId, foreignUserId} = req.body;    
    try {
        const currentProfile = await ProfileModel.findById(currentUserId)
        const foreignProfile = await ProfileModel.findById(foreignUserId)
        if(!currentProfile.pins.includes(foreignUserId)) {
            await currentProfile.updateOne({$push: {pins:foreignUserId}});
            await foreignProfile.updateOne({$push: {pinned:currentUserId}});
            res.status(200).json('Profile pinned')
        } else {
            await currentProfile.updateOne({$pull: {pins:foreignUserId}});
            await foreignProfile.updateOne({$pull: {pinned:currentUserId}});
            res.status(200).json('Profile unpinned!')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getUsersToPin = async (req, res) => {
    const {id} = req.params;
    try {
        const currentUser = await ProfileModel.findById(id);
        const sameUser = await ProfileModel.find({$or: [{status: currentUser.status}]}).populate('userId', 'firstname lastname')

        let idArr = [];
        sameUser.forEach(item=>{
            idArr.push(item._id)
        })

        let userSuggestion;
        if(idArr.length!==0){
            userSuggestion = await ProfileModel.find({_id: {$in: idArr}})
            .select('status school option university filiere profession entreprise')
            .populate('userId', 'username firstname lastname')
        }
        res.status(200).json(userSuggestion);
    } catch (error) {
      res.status(500).json(error);
    }
}

export const createPinCategory = async (req, res) => {
    const {author, name, color} = req.body;
    try {
        const newPinCategory = new PinCategoryModel({author, name, color});
        await newPinCategory.save();
        res.status(201).json(newPinCategory)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getPinCategory = async (req, res) => {
    const {id} = req.params;
    try {
        const currentUser = await ProfileModel.findById(id);
        const pinCategory = await PinCategoryModel.find({author: currentUser._id})
        res.status(200).json(pinCategory);
    } catch (error) {
      res.status(500).json(error);
    }
}

export const addInPinCategory = async (req, res) => {
    const {pinId, userArray} = req.body;
    try {
        const pin = await PinCategoryModel.findById(pinId)
        for (let i=0; i<userArray.length; i++) {
            const checkExistingMember = await pin.pins.includes(userArray[i]);
            if(!checkExistingMember) {
                await pin.updateOne({$push: {pins: userArray[i]}});
                console.log('added');
            } else {
                console.log('existing');
            }
        }
        const addedPins = await pin.save();
        res.status(200).json(addedPins)
    } catch (error) {
        res.status(500).json(error)
    }
}