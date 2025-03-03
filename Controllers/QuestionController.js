import QuestionModel from "../Models/questionModel.js"
import SubjectModel from "../Models/subjectModel.js"
import ProfileModel from "../Models/profileModel.js";

export const addSubject = async (req, res) => {
    try {
        if(!req.body.name && !req.body.color) {
            res.status(400).json('Ajoutez un sujet...')
        } else {
            const newSubject = new SubjectModel(req.body);
            await newSubject.save();
            res.status(200).json(newSubject)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getSubjects = async (req, res) => {
    try {
        const subjects = await SubjectModel.find().select('_id name color')
        res.status(200).json(subjects)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const addUserSubject = async (req, res) => {
    try {
        if(!req.body.subjects) {
            res.status(400).json('Ajoutez des sujets...')
        } else if(!req.body.profileId) {
            res.status(400).json('Profile non défini')
        } else {
            const subjects = await SubjectModel.find().select('-_id name')
            const profile = await ProfileModel.findById(req.body.profileId).populate('userId', '-password')
            await profile.updateOne({$push: {"subjects": [...req.body.subjects]}})
            res.status(200).json(profile)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const addQuestion = async (req, res) => {
    try {
        if(!req.body.content) {
            res.status(400).json('Ajoutez du contenu...')
        } else {
            const newQuestion = new QuestionModel(req.body);
            await newQuestion.save();
            res.status(200).json(newQuestion)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getQuestions = async (req, res) => {
    const {userId} = req.params
    try {
        const getUser = await ProfileModel.findById(userId)
        const questions = await QuestionModel.find({$or: [{author: getUser._id}, {subjects: {$in: getUser.subjects}}]}).sort({createdAt: -1})
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
            select: '_id name color',
        })
        res.status(200).json(questions)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getUserQuestions = async (req, res) => {
    const {userId} = req.params
    try {
        const profile = await ProfileModel.findById(userId)
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
            select: '_id name color',
        })
        res.status(200).json(questions)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getSingleQuestion = async (req, res) => {
    const {id, userId} = req.params;
    try {
        const question = await QuestionModel.findById(id)
        .populate({
            path: 'author',
            select: 'userId profilePicture',
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
            select: '_id name color',
        })

        // Add viewer
        if(userId){
            if(!question.viewers.includes(userId)) {
                await question.updateOne({$push: {viewers:userId}});
            }
        }
        
        res.status(200).json(question)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getSubjectQuestions = async (req, res) => {
    const id = req.params.id;
    try {
        const questions = await QuestionModel.find({subjects: {$in: id}})
        .populate({
            path: 'author',
            select: 'userId profilePicture',
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
            select: '_id name color',
        })
        res.status(200).json(questions)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updateQuestion = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await PostModel.findById(postId)
        if(post.userId === currentUserId) {
            await post.updateOne({$set:req.body})
            res.status(200).json('Post Updated!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
} 

export const deleteQuestion = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await PostModel.findById(postId)
        if(post.userId === currentUserId) {
            await post.deleteOne();
            res.status(200).json('Post Deleted!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const likeQuestion = async (req, res) => {
    const {currentUserId, questionId} = req.body;
    
    try {
        const question = await QuestionModel.findById(questionId)
        if(!question.likes.includes(currentUserId)) {
            if(!question.dislikes.includes(currentUserId)) {
                await question.updateOne({$push: {likes:currentUserId}});
                res.status(200).json('Question push Like!')
            } else {
                await question.updateOne({$pull: {dislikes:currentUserId}});
                await question.updateOne({$push: {likes:currentUserId}});
                res.status(200).json('Question pull dislike & push like!')
            }
        } else {
            await question.updateOne({$pull: {likes:currentUserId}});
            res.status(200).json('Question pull like!')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const dislikeQuestion = async (req, res) => {
    const {currentUserId, questionId} = req.body;
    try {
        const question = await QuestionModel.findById(questionId)
        if(!question.dislikes.includes(currentUserId)) {
            if(!question.likes.includes(currentUserId)) {
                await question.updateOne({$push: {dislikes:currentUserId}});
                res.status(200).json('Question push dislike!')
            } else {
                await question.updateOne({$pull: {likes:currentUserId}});
                await question.updateOne({$push: {dislikes:currentUserId}});
                res.status(200).json('Question pull like & push dislike!')
            }
        } else {
            await question.updateOne({$pull: {dislikes:currentUserId}});
            res.status(200).json('Question pull dislike!')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}