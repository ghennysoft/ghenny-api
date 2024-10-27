import AnswerModel from "../Models/answerModel.js";
import QuestionModel from "../Models/questionModel.js";

export const addAnswer = async (req, res) => {
    try {
        if(!req.body.content) {
            res.status(400).json('Tapez votre reponse...')
        } else if(!req.body.questionId) {
            res.status(400).json('Question id empty...')
        } else {
            const newAnswer = new AnswerModel(req.body);
            await newAnswer.save();

            const find_question = await QuestionModel.findById(req.body.questionId)
            await find_question.updateOne({$push: {"Answers": newAnswer._id}})
            res.status(200).json({message: "Reponse ajouté avec success!", answer: newAnswer})
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updateComment = async (req, res) => {
    const commentId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const comment = await CommentModel.findById(commentId)
        if(comment.userId === currentUserId) {
            await comment.updateOne({$set:req.body})
            res.status(200).json('Comment Updated!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
} 

export const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const comment = await CommentModel.findById(commentId)
        if(comment.userId === currentUserId) {
            await comment.deleteOne();
            res.status(200).json('Comment Deleted!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const likeDislikeComment = async (req, res) => {
    const {currentUserId, commentId} = req.body;
    
    try {
        const comment = await CommentModel.findById(commentId)
        if(!comment.likes.includes(currentUserId)) {
            await comment.updateOne({$push: {likes:currentUserId}});
            res.status(200).json({msg: 'Comment Liked!', comment: comment})
        } else {
            await comment.updateOne({$pull: {likes:currentUserId}});
            res.status(200).json({msg: 'Comment Unliked!', comment: comment})
        }
    } catch (error) {
        res.status(500).json(error)
    }
}